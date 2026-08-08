> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# AppleContainerSandbox

Executes commands inside local OCI Linux containers through Apple's [`container`](https://github.com/apple/container) CLI. The provider starts a long-lived container and uses `container exec` for workspace commands. For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

## Installation

**npm**:

```bash
npm install @mastra/apple-container
```

**pnpm**:

```bash
pnpm add @mastra/apple-container
```

**Yarn**:

```bash
yarn add @mastra/apple-container
```

**Bun**:

```bash
bun add @mastra/apple-container
```

Requires an Apple silicon Mac running macOS 26 or newer with Apple's `container` CLI installed. Start the container system before using the provider:

```bash
container system start
```

## Usage

Add an `AppleContainerSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { AppleContainerSandbox } from '@mastra/apple-container'

const workspace = new Workspace({
  sandbox: new AppleContainerSandbox({
    image: 'node:22-slim',
    volumes: {
      '/Users/me/project': '/workspace',
    },
    workingDir: '/workspace',
  }),
})

const agent = new Agent({
  id: 'dev-agent',
  name: 'Dev Agent',
  instructions: 'You are a coding assistant working in this workspace.',
  model: 'anthropic/claude-sonnet-4-6',
  workspace,
})

const response = await agent.generate('Run `node --version`.')
console.log(response.text)
```

## Constructor parameters

**id** (`string`): Unique identifier for this sandbox instance. (Default: `Auto-generated`)

**name** (`string`): Apple container name passed to container run --name. Characters outside \[a-zA-Z0-9\_.-] are replaced with - and the result is prefixed if it would not start with an alphanumeric character. (Default: `` The sandbox `id` ``)

**image** (`string`): OCI image to use for the container. (Default: `'node:22-slim'`)

**command** (`string[]`): Container init command. Must keep the container alive for exec-based command execution. (Default: `['sleep', 'infinity']`)

**env** (`Record<string, string>`): Environment variables to set in the container and on command execs.

**volumes** (`Record<string, string>`): Host-to-container bind mounts. Keys are host paths, values are container paths.

**mounts** (`string[]`): Raw container run --mount specs.

**network** (`string`): Apple container network attachment spec.

**publishedPorts** (`string[]`): Port publish specs passed as --publish.

**publishedSockets** (`string[]`): Socket publish specs passed as --publish-socket.

**cpus** (`number | string`): Number of CPUs to allocate.

**memory** (`string`): Memory allocation, for example '1G'.

**platform** (`string`): OCI platform, for example 'linux/arm64'.

**arch** (`string`): Image architecture when selecting a multi-arch image.

**os** (`string`): Image operating system when selecting a multi-platform image.

**rosetta** (`boolean`): Enable Rosetta in the container. (Default: `false`)

**readonlyRootfs** (`boolean`): Mount the container root filesystem as read-only. (Default: `false`)

**ssh** (`boolean`): Forward the host SSH agent socket. (Default: `false`)

**init** (`boolean`): Enable Apple's init process in the container. (Default: `true`)

**virtualization** (`boolean`): Expose virtualization capabilities to the container. (Default: `false`)

**capAdd** (`string[]`): Linux capabilities to add.

**capDrop** (`string[]`): Linux capabilities to drop.

**tmpfs** (`string[]`): tmpfs destination paths passed as --tmpfs, for example /tmp.

**dns** (`string[]`): DNS nameserver IPs.

**dnsSearch** (`string[]`): DNS search domains.

**noDns** (`boolean`): Do not configure DNS in the container. (Default: `false`)

**labels** (`Record<string, string>`): Additional container labels. Mastra labels (mastra.sandbox, mastra.sandbox.id) are always included.

**workingDir** (`string`): Working directory inside the container. (Default: `'/workspace'`)

**timeout** (`number`): Default command timeout in milliseconds. (Default: `300000 (5 minutes)`)

**deleteOnDestroy** (`boolean`): Delete the Apple container when the sandbox is destroyed. When false, destroy stops the container instead. (Default: `true`)

**containerBinary** (`string`): Path or name for the Apple container CLI. (Default: `'container'`)

**instructions** (`string | function`): Custom instructions that override the default instructions returned by getInstructions(). Pass an empty string to suppress instructions.

## Properties

**id** (`string`): Sandbox instance identifier.

**name** (`string`): Provider name ('AppleContainerSandbox').

**provider** (`string`): Provider identifier ('apple-container').

**status** (`ProviderStatus`): 'pending' | 'starting' | 'running' | 'stopping' | 'stopped' | 'destroying' | 'destroyed' | 'error'

**containerId** (`string`): Apple container ID when known, otherwise the configured container name.

## Environment variables

Set environment variables at the container level with `env`. Per-command environment variables can also be passed through `executeCommand` options:

```typescript
const sandbox = new AppleContainerSandbox({
  image: 'node:22-slim',
  env: {
    NODE_ENV: 'development',
  },
})

await sandbox.executeCommand('node', ['-e', 'console.log(process.env.TASK_ID)'], {
  env: { TASK_ID: '42' },
})
```

## Bind mounts

Mount host directories into the container using the `volumes` option:

```typescript
const sandbox = new AppleContainerSandbox({
  image: 'node:22-slim',
  volumes: {
    '/Users/me/project': '/workspace/project',
    '/Users/me/.npm': '/root/.npm',
  },
})
```

Bind mounts are applied at container creation time. The host paths must exist before the sandbox starts.

## Resource and platform options

Apple container CLI options can be passed through the constructor:

```typescript
const sandbox = new AppleContainerSandbox({
  image: 'node:22-slim',
  volumes: {
    '/Users/me/project': '/workspace',
  },
  cpus: 2,
  memory: '2G',
  platform: 'linux/arm64',
  readonlyRootfs: true,
  tmpfs: ['/tmp'],
})
```

These options are only applied when a new container is created. If the sandbox reconnects to an existing container with the same name, destroy and recreate the sandbox to apply changed runtime options. Apple `--tmpfs` accepts container paths only, such as `/tmp`; it doesn't accept Docker-style option specs like `/tmp:rw,size=256m`. When `readonlyRootfs` is enabled, make sure `workingDir` points to a path supplied by the image or a bind mount. A writable tmpfs is also supported.

## Security model

`AppleContainerSandbox` runs local containers through the host Apple `container` service. Treat constructor options as trusted server-side configuration:

- `volumes`, `mounts`, and `publishedSockets` can expose host paths to containerized code.
- `publishedPorts` can expose in-container services on the host or network. Bind to `127.0.0.1` when only local access is intended.
- `ssh` forwards the host SSH agent socket.
- `capAdd` and `virtualization` can expand what containerized code can do.
- `containerBinary` is a constructor-only escape hatch for trusted code and isn't part of the serializable editor provider schema.

Use the narrowest mounts and capabilities your workload needs. Existing containers are only reconnected when they carry Mastra ownership labels for the sandbox ID. Containers created by this provider also include a config-hash label; when that label is present, reconnect fails if immutable runtime options such as image, command, mounts, ports, capabilities, or working directory changed.

## Limitations

`AppleContainerSandbox` implements foreground workspace command execution with `executeCommand()`. It doesn't yet expose a `SandboxProcessManager` for background processes or LSP sessions.

Command timeouts are enforced inside the container so timed-out commands are cleaned up by the container runtime. Abort signals cancel the host CLI wait path and shouldn't be used as a substitute for command timeouts when in-container cleanup matters.

## Reconnection

`AppleContainerSandbox` reconnects by inspecting a container with the configured name. When `start()` is called:

- A running container is reused.
- A stopped container is restarted.
- A missing container is created from the configured image.
- A container with the configured name but without matching Mastra ownership labels fails instead of being managed.
- A Mastra-owned container with a config-hash label that doesn't match immutable runtime options fails instead of being reused.

```typescript
const sandbox = new AppleContainerSandbox({ id: 'persistent-sandbox' })
await sandbox.start()

const sandbox2 = new AppleContainerSandbox({ id: 'persistent-sandbox' })
await sandbox2.start()
```

## Editor provider

Register the provider with `MastraEditor` to hydrate stored sandbox configs:

```typescript
import { MastraEditor } from '@mastra/editor'
import { appleContainerSandboxProvider } from '@mastra/apple-container'

const editor = new MastraEditor({
  sandboxes: {
    [appleContainerSandboxProvider.id]: appleContainerSandboxProvider,
  },
})
```

## Related

- [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox)
- [DockerSandbox reference](https://mastra.ai/reference/workspace/docker-sandbox)
- [LocalSandbox reference](https://mastra.ai/reference/workspace/local-sandbox)
- [Workspace overview](https://mastra.ai/docs/workspace/overview)