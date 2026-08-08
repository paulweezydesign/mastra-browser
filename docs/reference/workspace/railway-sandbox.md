> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# RailwaySandbox

Executes commands in ephemeral, isolated [Railway](https://docs.railway.com/sandboxes) sandboxes. Each sandbox is an isolated Debian Linux VM provisioned on demand through the Railway TypeScript SDK. Supports command execution with streaming output, command timeouts, configurable idle timeout, `ISOLATED`/`PRIVATE` network isolation, custom base images via the Railway template builder, checkpoint-backed recovery, forking a running sandbox, and reattaching to an existing sandbox by ID. For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

## Installation

**npm**:

```bash
npm install @mastra/railway
```

**pnpm**:

```bash
pnpm add @mastra/railway
```

**Yarn**:

```bash
yarn add @mastra/railway
```

**Bun**:

```bash
bun add @mastra/railway
```

Set your Railway credentials in one of three ways.

**Shell export**:

```bash
export RAILWAY_API_TOKEN=your-api-token
export RAILWAY_ENVIRONMENT_ID=your-environment-id
```

**.env file**:

```bash
RAILWAY_API_TOKEN=your-api-token
RAILWAY_ENVIRONMENT_ID=your-environment-id
```

**Constructor**:

```typescript
new RailwaySandbox({
  token: 'your-api-token',
  environmentId: 'your-environment-id',
})
```

## Usage

Add a `RailwaySandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { RailwaySandbox } from '@mastra/railway'

const workspace = new Workspace({
  sandbox: new RailwaySandbox({
    // token + environmentId read from RAILWAY_API_TOKEN / RAILWAY_ENVIRONMENT_ID
    idleTimeoutMinutes: 30,
  }),
})

const agent = new Agent({
  id: 'code-agent',
  name: 'Code Agent',
  instructions: 'You are a coding assistant working in this workspace.',
  model: 'anthropic/claude-sonnet-4-6',
  workspace,
})

const response = await agent.generate(
  'Print "Hello, world!" and show the current working directory.',
)

console.log(response.text)
```

### Private networking

Join the environment's private network to reach other Railway services (for example `postgres.railway.internal`):

```typescript
const workspace = new Workspace({
  sandbox: new RailwaySandbox({
    networkIsolation: 'PRIVATE',
    env: { NODE_ENV: 'production' },
  }),
})
```

The default `ISOLATED` mode allows outbound internet access only, with no private network connectivity.

### Custom base image (templates)

Pre-install packages and run setup steps so every sandbox starts ready. Pass a builder callback over the Railway template builder: the template is built once on the first `start()`:

```typescript
const workspace = new Workspace({
  sandbox: new RailwaySandbox({
    template: t => t.withPackages('git', 'curl').run('npm i -g pnpm').workdir('/app'),
  }),
})
```

You can also pass a pre-built `SandboxTemplate` to reuse it across sandboxes without rebuilding. Templates are ignored when `sandboxId` is set, since reattaching uses the existing sandbox's filesystem.

### Forking a running sandbox

Clone a running sandbox's filesystem into a new, independent sandbox: a fresh boot, not live processes. The returned `RailwaySandbox` is already started:

```typescript
const child = await sandbox.fork({ idleTimeoutMinutes: 15 })

const result = await child.executeCommand('cat', ['/app/state.json'])
console.log(result.stdout)
```

The forked sandbox inherits the parent's credentials and defaults unless overridden via the `fork()` options.

### Checkpoint recovery

Set `checkpointName` to preserve a sandbox filesystem across Railway sandbox replacement. On `start()`, `RailwaySandbox` first tries to create the sandbox from the checkpoint. If the checkpoint is missing, it creates a sandbox from the configured template or default image, then captures the checkpoint.

```typescript
const sandbox = new RailwaySandbox({
  checkpointName: 'project-session-42',
  idleTimeoutMinutes: 30,
})
```

`RailwaySandbox` refreshes the checkpoint shortly before the idle timeout. Recovery restores the latest successful checkpoint. It doesn't restore running processes or filesystem writes made after the last checkpoint.

Use one stable checkpoint name for each independent filesystem. Don't share a checkpoint name across unrelated sessions or projects.

### Cloned sandbox checkpoints

Use `clone({ checkpointName })` when a configured `RailwaySandbox` acts as the template for a sandbox fleet:

```typescript
const template = new RailwaySandbox({ idleTimeoutMinutes: 30 })

const sessionSandbox = template.clone({
  id: 'session-42',
  checkpointName: 'project-session-42',
})

await sessionSandbox.start()
```

A cloned sandbox uses the checkpoint passed to `clone()`. If no override is passed, it inherits the template sandbox's `checkpointName`.

### Streaming output

Stream command output in real time via `onStdout` and `onStderr` callbacks:

```typescript
await sandbox.executeCommand('bash', ['-c', 'for i in 1 2 3; do echo "line $i"; sleep 1; done'], {
  onStdout: chunk => process.stdout.write(chunk),
  onStderr: chunk => process.stderr.write(chunk),
})
```

Both callbacks are optional and can be used independently.

### Reattaching to an existing sandbox

A Railway sandbox outlives the process that created it. Reconnect by its Railway ID instead of provisioning a new one:

```typescript
const sandbox = new RailwaySandbox({ sandboxId: 'existing-railway-sandbox-id' })
await sandbox._start()

const result = await sandbox.executeCommand('cat', ['/tmp/state.txt'])
```

## Constructor parameters

**id** (`string`): Unique identifier for this sandbox instance. (Default: `Auto-generated`)

**token** (`string`): Railway API token for authentication. Falls back to the RAILWAY\_API\_TOKEN environment variable.

**environmentId** (`string`): Railway environment ID. Falls back to the RAILWAY\_ENVIRONMENT\_ID environment variable.

**sandboxId** (`string`): Reattach to an existing Railway sandbox by its Railway ID instead of creating a new one. When set, start() calls Sandbox.connect().

**checkpointName** (`string`): Named Railway checkpoint used to seed new sandboxes and preserve the filesystem before idle teardown. Use a unique stable name for each independent filesystem.

**idleTimeoutMinutes** (`number`): How long the sandbox can sit idle (no exec interaction) before Railway destroys it automatically. The valid range and default depend on your Railway plan.

**networkIsolation** (`'ISOLATED' | 'PRIVATE'`): Network access mode. 'ISOLATED' allows outbound internet only; 'PRIVATE' joins the environment's private network. (Default: `'ISOLATED'`)

**env** (`Record<string, string>`): Environment variables baked into the sandbox, available to every command. (Default: `{}`)

**template** (`SandboxTemplate | (base: SandboxTemplate) => SandboxTemplate`): Provision the sandbox from a custom base image built with the Railway template builder. Accepts a builder callback or a pre-built template. Ignored when sandboxId is set.

**timeout** (`number`): Default execution timeout in milliseconds applied to commands that do not specify their own timeout. Commands run until they exit when omitted.

**instructions** (`string | (opts) => string`): Override the default agent instructions. A string replaces them entirely; a function receives the default instructions and returns the final text.

## Properties

**id** (`string`): Sandbox instance identifier.

**name** (`string`): Provider name ('RailwaySandbox').

**provider** (`string`): Provider identifier ('railway').

**status** (`ProviderStatus`): 'pending' | 'initializing' | 'ready' | 'stopped' | 'destroyed' | 'error'

**railway** (`Sandbox`): The underlying Railway Sandbox instance for direct SDK access. Throws SandboxNotReadyError if the sandbox has not been started.

**processes** (`RailwayProcessManager`): Background process manager. See SandboxProcessManager reference.

## Methods

**fork** (`(options?) => Promise<RailwaySandbox>`): Clone this running sandbox into a new, independent RailwaySandbox. The returned sandbox is already started and reattached to the forked Railway sandbox. Accepts optional id, idleTimeoutMinutes, networkIsolation, and env overrides. Throws SandboxNotReadyError if this sandbox has not been started.

**clone** (`(options?) => RailwaySandbox`): Construct an unstarted sibling sandbox that inherits credentials and defaults. Accepts optional id, sandboxId, env, idleTimeoutMinutes, and checkpointName overrides. The cloned sandbox uses options.checkpointName when set, otherwise it inherits the template checkpointName.

## Background processes

`RailwaySandbox` includes a built-in process manager for spawning and managing background processes. Each spawned process runs as a Railway `exec` session.

```typescript
const sandbox = new RailwaySandbox()
await sandbox.start()

// Spawn a background process
const handle = await sandbox.processes.spawn('node server.js', {
  env: { PORT: '3000' },
  onStdout: data => console.log(data),
})

// Interact with the process
console.log(handle.stdout)
await handle.kill()
```

Railway's `exec` API doesn't stream stdin, so `sendStdin()` isn't supported.

See [`SandboxProcessManager` reference](https://mastra.ai/reference/workspace/process-manager) for the full API.

## Editor provider

Register the provider with `MastraEditor` to hydrate stored sandbox configs into runtime instances:

```typescript
import { railwaySandboxProvider } from '@mastra/railway'

const editor = new MastraEditor({
  sandboxes: { [railwaySandboxProvider.id]: railwaySandboxProvider },
})
```

See the [Sandbox provider reference](https://mastra.ai/reference/editor/sandbox-provider) for details on registering custom sandbox providers.