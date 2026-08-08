> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# DockerSandbox

Executes commands inside Docker containers on the local machine. Uses long-lived containers with `docker exec` for command execution. Targets local development, CI/CD, air-gapped deployments, and cost-sensitive scenarios where cloud sandboxes are unnecessary. For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

## Installation

**npm**:

```bash
npm install @mastra/docker
```

**pnpm**:

```bash
pnpm add @mastra/docker
```

**Yarn**:

```bash
yarn add @mastra/docker
```

**Bun**:

```bash
bun add @mastra/docker
```

Requires [Docker Engine](https://docs.docker.com/engine/install/) running on the host machine.

## Usage

Add a `DockerSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { DockerSandbox } from '@mastra/docker'

const workspace = new Workspace({
  sandbox: new DockerSandbox({
    image: 'node:22-slim',
  }),
})

const agent = new Agent({
  id: 'dev-agent',
  name: 'dev-agent',
  model: 'anthropic/claude-opus-4-7',
  workspace,
})
```

## Constructor parameters

**id** (`string`): Unique identifier for this sandbox instance. Used for label-based reconnection. (Default: `Auto-generated`)

**name** (`string`): Container display name passed to Docker as --name. Characters outside \[a-zA-Z0-9\_.-] are replaced with - and the result is prefixed if it would not start with an alphanumeric character. (Default: `` The sandbox `id` ``)

**image** (`string`): Docker image to use for the container. (Default: `'node:22-slim'`)

**command** (`string[]`): Container entrypoint command. Must keep the container alive for exec-based command execution. (Default: `['sleep', 'infinity']`)

**env** (`Record<string, string>`): Environment variables to set in the container.

**volumes** (`Record<string, string>`): Host-to-container bind mounts. Keys are host paths, values are container paths.

**network** (`string`): Docker network to join.

**privileged** (`boolean`): Run in privileged mode. (Default: `false`)

**memory** (`number`): Memory limit in bytes. Docker treats 0 as unlimited. Maps to Docker HostConfig.Memory.

**memorySwap** (`number`): Total memory plus swap in bytes. Maps to Docker HostConfig.MemorySwap.

**cpuShares** (`number`): CPU shares relative weight. Maps to Docker HostConfig.CpuShares.

**cpuQuota** (`number`): CPU quota in microseconds per period. Maps to Docker HostConfig.CpuQuota.

**cpuPeriod** (`number`): CPU period in microseconds. Maps to Docker HostConfig.CpuPeriod.

**pidsLimit** (`number`): Maximum number of process IDs in the container. Maps to Docker HostConfig.PidsLimit.

**readonlyRootfs** (`boolean`): Mount the container root filesystem as read-only. Maps to Docker HostConfig.ReadonlyRootfs.

**capDrop** (`string[]`): Linux capabilities to drop. Use \['ALL'] to drop all capabilities before adding specific ones. Maps to Docker HostConfig.CapDrop.

**capAdd** (`string[]`): Linux capabilities to add back after drops, such as NET\_BIND\_SERVICE. Maps to Docker HostConfig.CapAdd.

**securityOpt** (`string[]`): Docker security options, such as \['no-new-privileges:true']. Maps to Docker HostConfig.SecurityOpt.

**ulimits** (`Array<{ name: string; soft: number; hard: number }>`): Ulimit entries for the container. Maps to Docker HostConfig.Ulimits.

**tmpfs** (`Record<string, string>`): tmpfs mount paths and options. Maps to Docker HostConfig.Tmpfs.

**workingDir** (`string`): Working directory inside the container. (Default: `'/workspace'`)

**labels** (`Record<string, string>`): Additional container labels. Mastra labels (mastra.sandbox, mastra.sandbox.id) are always included.

**timeout** (`number`): Default command timeout in milliseconds. (Default: `300000 (5 minutes)`)

**dockerOptions** (`Docker.DockerOptions`): Pass-through dockerode connection options for custom socket paths, remote hosts, or TLS certificates.

**instructions** (`string | function`): Custom instructions that override the default instructions returned by getInstructions(). Pass an empty string to suppress instructions.

## Properties

**id** (`string`): Sandbox instance identifier.

**name** (`string`): Provider name ('DockerSandbox').

**provider** (`string`): Provider identifier ('docker').

**status** (`ProviderStatus`): 'pending' | 'starting' | 'running' | 'stopping' | 'stopped' | 'destroying' | 'destroyed' | 'error'

**container** (`Container`): The underlying dockerode Container instance. Throws SandboxNotReadyError if the sandbox has not been started.

**processes** (`DockerProcessManager`): Background process manager. See SandboxProcessManager reference.

## Background processes

`DockerSandbox` includes a built-in process manager for spawning and managing background processes. Processes run inside the container using `docker exec`.

```typescript
const sandbox = new DockerSandbox({ id: 'dev-sandbox' })
await sandbox._start()

// Spawn a background process
const handle = await sandbox.processes.spawn('node server.js', {
  env: { PORT: '3000' },
  onStdout: data => console.log(data),
})

// Interact with the process
console.log(handle.stdout)
await handle.sendStdin('input\n')
await handle.kill()
```

See [`SandboxProcessManager` reference](https://mastra.ai/reference/workspace/process-manager) for the full API.

## Environment variables

Set environment variables at the container level with `env`. Per-command environment variables can also be passed when spawning processes:

```typescript
const sandbox = new DockerSandbox({
  image: 'node:22-slim',
  env: {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgres://localhost:5432/mydb',
  },
})
```

## Bind mounts

Mount host directories into the container using the `volumes` option:

```typescript
const sandbox = new DockerSandbox({
  image: 'node:22-slim',
  volumes: {
    '/my/project': '/workspace/project',
    '/shared/data': '/data',
  },
})
```

Bind mounts are applied at container creation time. The host paths must exist before the sandbox starts.

## Hardening

Use Docker-specific resource and hardening options to limit a sandbox container. The following example caps memory and process count while limiting CPU to a single core with matching `cpuPeriod` and `cpuQuota` values. It drops Linux capabilities and makes the root filesystem read-only, with `/tmp` mounted as writable scratch space:

```typescript
const sandbox = new DockerSandbox({
  image: 'node:22-slim',
  memory: 512 * 1024 * 1024,
  memorySwap: 512 * 1024 * 1024,
  cpuPeriod: 100_000,
  cpuQuota: 100_000,
  pidsLimit: 256,
  readonlyRootfs: true,
  capDrop: ['ALL'],
  capAdd: ['NET_BIND_SERVICE'],
  securityOpt: ['no-new-privileges:true'],
  ulimits: [{ name: 'nofile', soft: 1024, hard: 2048 }],
  tmpfs: {
    '/tmp': 'rw,noexec,nosuid,size=64m',
  },
})
```

These options map directly to Docker `HostConfig` fields and aren't set unless you pass them.

Review these trade-offs before enabling hardening:

- `readonlyRootfs`: In-container package installs and tools that write outside mounted paths can fail. Add `tmpfs` entries for writable scratch paths such as `/tmp`, and mount tmpfs or volumes for package-manager caches such as `~/.npm` when needed.
- `capDrop`: Dropping all capabilities disables commands that need Linux capabilities, including `ping` and mount operations. FUSE-backed tools are also disabled. Add back only the capabilities your workload needs.
- `memory`: Docker treats `0` as unlimited. Omit `memory` or pass `0` only when you don't want a memory cap.
- `memorySwap`: Docker memory and swap behavior depends on the host and Docker daemon configuration. When you set `memory` without `memorySwap`, Docker allows swap up to twice the memory limit by default. Set `memorySwap` equal to `memory` when you want to disable swap for the container; Docker also accepts `-1` for unlimited swap.
- `pidsLimit`: Very low values can break `docker exec` workloads because each command starts additional processes inside the long-lived container.
- `privileged`: Privileged containers bypass capability and security-option controls. Don't combine `privileged: true` with capability or security options unless the workload requires it.
- Reconnection: `DockerSandbox` reuses an existing container when the sandbox ID matches and warns if inspected `HostConfig` hardening values differ. Destroy and recreate the sandbox to apply changed hardening options. Docker can normalize inspected values, and changing `memorySwap` on reconnect can trigger a warning if the original container used Docker's default swap behavior.
- Docker Desktop: Resource limits apply inside the Docker Desktop virtual machine on macOS and Windows, so the VM's allocated resources can cap what containers receive.

## Reconnection

`DockerSandbox` can reconnect to existing containers by matching labels. When `start()` is called, it checks for a container with the `mastra.sandbox.id` label matching the sandbox ID. If found:

- A running container is reused directly.
- A stopped container is restarted.

```typescript
// First run — creates a new container
const sandbox = new DockerSandbox({ id: 'persistent-sandbox' })
await sandbox._start()

// Later — reconnects to the existing container
const sandbox2 = new DockerSandbox({ id: 'persistent-sandbox' })
await sandbox2._start()
```

## Docker connection options

Connect to remote Docker hosts or use custom socket paths via `dockerOptions`:

```typescript
// Remote Docker host
const sandbox = new DockerSandbox({
  dockerOptions: {
    host: '192.168.1.100',
    port: 2376,
    ca: fs.readFileSync('ca.pem'),
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem'),
  },
})

// Custom socket path
const sandbox = new DockerSandbox({
  dockerOptions: {
    socketPath: '/var/run/docker.sock',
  },
})
```

## Related

- [SandboxProcessManager reference](https://mastra.ai/reference/workspace/process-manager)
- [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox)
- [LocalSandbox reference](https://mastra.ai/reference/workspace/local-sandbox)
- [E2BSandbox reference](https://mastra.ai/reference/workspace/e2b-sandbox)
- [Workspace overview](https://mastra.ai/docs/workspace/overview)