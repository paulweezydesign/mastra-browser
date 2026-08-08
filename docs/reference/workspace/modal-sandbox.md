> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# ModalSandbox

Executes commands in isolated [Modal](https://modal.com) cloud sandboxes. Provides secure, ephemeral environments backed by Modal's infrastructure. For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

## Installation

**npm**:

```bash
npm install @mastra/modal
```

**pnpm**:

```bash
pnpm add @mastra/modal
```

**Yarn**:

```bash
yarn add @mastra/modal
```

**Bun**:

```bash
bun add @mastra/modal
```

## Usage

Add a `ModalSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { ModalSandbox } from '@mastra/modal'

const workspace = new Workspace({
  sandbox: new ModalSandbox({
    id: 'dev-sandbox',
    baseImage: 'ubuntu:22.04',
    timeoutMs: 60_000,
  }),
})

const agent = new Agent({
  id: 'dev-agent',
  model: 'anthropic/claude-opus-4-7',
  workspace,
})
```

## Authentication

Set Modal credentials via environment variables or constructor options:

```bash
MODAL_TOKEN_ID=ak-...
MODAL_TOKEN_SECRET=as-...
```

Or pass them directly:

```typescript
const sandbox = new ModalSandbox({
  tokenId: process.env.MODAL_TOKEN_ID,
  tokenSecret: process.env.MODAL_TOKEN_SECRET,
})
```

Get your credentials from the [Modal dashboard](https://modal.com/settings/tokens).

## Constructor parameters

**id** (`string`): Unique identifier / name for this sandbox. Used as the Modal sandbox name so the sandbox can be reconnected on subsequent start() calls. (Default: `Auto-generated`)

**appName** (`string`): Modal App name to associate sandboxes with. (Default: `'mastra'`)

**baseImage** (`string`): Docker image to use for the sandbox. (Default: `'ubuntu:22.04'`)

**timeoutMs** (`number`): Wall-clock max lifetime in milliseconds. The sandbox is terminated when this expires, regardless of activity. Modal's maximum is 24 hours (86\_400\_000). (Default: `300000 (5 minutes)`)

**env** (`Record<string, string>`): Environment variables baked into the sandbox at create time.

**workdir** (`string`): Default working directory inside the sandbox.

**tokenId** (`string`): Modal token ID. Falls back to MODAL\_TOKEN\_ID environment variable.

**tokenSecret** (`string`): Modal token secret. Falls back to MODAL\_TOKEN\_SECRET environment variable.

**instructions** (`string | function`): Custom instructions returned by getInstructions(). Pass a string to fully replace the default, or a function to extend it.

**onStart** (`function`): Lifecycle hook called after the sandbox reaches running status.

**onStop** (`function`): Lifecycle hook called before the sandbox stops.

**onDestroy** (`function`): Lifecycle hook called before the sandbox is destroyed.

## Properties

**id** (`string`): Sandbox instance identifier.

**name** (`string`): Provider name ('ModalSandbox')

**provider** (`string`): Provider identifier ('modal')

**status** (`ProviderStatus`): 'pending' | 'starting' | 'running' | 'stopping' | 'stopped' | 'destroying' | 'destroyed' | 'error'

**modal** (`Sandbox`): The underlying Modal Sandbox instance. Throws SandboxNotReadyError if the sandbox has not been started.

**processes** (`ModalProcessManager`): Background process manager. See SandboxProcessManager reference.

## Sandbox lifecycle

- **`_start()`**: Attempts to reconnect to an existing running sandbox. If none is found, creates a sandbox from the latest snapshot (if available from a previous `_stop()`), or from the baseImage.
- **`_stop()`**: Snapshots the filesystem, then terminates the sandbox. Snapshot is kept in memory on the same instance for future starts.
- **`_destroy()`**: Terminates the sandbox and discards any snapshot.

```typescript
const sandbox = new ModalSandbox({
  id: 'dev-sandbox',
  baseImage: 'ubuntu:22.04',
  timeoutMs: 300_000,
})

await sandbox._start()
await sandbox.processes.spawn('npm install')
await sandbox._stop()
await sandbox._start()
```

## Background processes

`ModalSandbox` includes a built-in process manager for spawning and managing background processes. Each `spawn()` call creates a new `ContainerProcess` via the Modal SDK's `Sandbox.exec()` API.

```typescript
const sandbox = new ModalSandbox({ id: 'dev-sandbox' })
await sandbox._start()

// Spawn a background process
const handle = await sandbox.processes.spawn('node script.js', {
  env: { PORT: '3000' },
  onStdout: data => console.log(data),
})

// Wait for the process to complete
const result = await handle.wait()
console.log(result.exitCode)

// Kill the process
await handle.kill()
```

> **Note:** `sendStdin()` isn't supported. The Modal JS SDK doesn't expose stdin on `Sandbox.exec()`.

See [`SandboxProcessManager` reference](https://mastra.ai/reference/workspace/process-manager) for the full API.

## Related

- [SandboxProcessManager reference](https://mastra.ai/reference/workspace/process-manager)
- [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox)
- [E2BSandbox reference](https://mastra.ai/reference/workspace/e2b-sandbox)
- [DaytonaSandbox reference](https://mastra.ai/reference/workspace/daytona-sandbox)
- [Workspace overview](https://mastra.ai/docs/workspace/overview)