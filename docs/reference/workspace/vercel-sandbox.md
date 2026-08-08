> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# VercelSandbox

Executes commands inside [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) which is an ephemeral [Firecracker](https://firecracker-microvm.github.io/) MicroVM running Amazon Linux 2023. Provides a persistent in-session filesystem, `sudo` access, exposed ports, and background processes. For interface details, see the [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

> **Note:** This is distinct from [`VercelServerlessSandbox`](https://mastra.ai/reference/workspace/vercel-serverless), which runs commands as stateless Vercel serverless **Functions**. `VercelSandbox` runs a full Linux MicroVM with a persistent filesystem and long-running processes.

## Installation

**npm**:

```bash
npm install @mastra/vercel
```

**pnpm**:

```bash
pnpm add @mastra/vercel
```

**Yarn**:

```bash
yarn add @mastra/vercel
```

**Bun**:

```bash
bun add @mastra/vercel
```

## Authentication

The `@vercel/sandbox` SDK uses a Vercel OIDC token automatically when no explicit credentials are provided. If you provide `token`, `teamId`, or `projectId`, provide all three values together.

**OIDC (recommended)**:

For local development, link the project and pull a development token:

```bash
vercel link
vercel env pull
```

On Vercel, authentication is handled automatically — no configuration needed.

**Access token (.env)**:

For environments without OIDC, provide all three values together:

```bash
VERCEL_TOKEN=your-token
VERCEL_TEAM_ID=your-team-id
VERCEL_PROJECT_ID=your-project-id
```

**Constructor**:

```typescript
new VercelSandbox({
  token: 'your-token',
  teamId: 'your-team-id',
  projectId: 'your-project-id',
})
```

## Usage

Add a `VercelSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { VercelSandbox } from '@mastra/vercel'

const workspace = new Workspace({
  sandbox: new VercelSandbox({
    runtime: 'node24',
    timeout: 600_000,
  }),
})

const agent = new Agent({
  id: 'code-agent',
  name: 'Code Agent',
  instructions: 'You are a coding assistant working in this workspace.',
  model: 'anthropic/claude-sonnet-4-6',
  workspace,
})

const response = await agent.generate('Print "Hello, world!" and show the Node.js version.')

console.log(response.text)
```

### Resources and exposed ports

Allocate vCPUs (2048 MB of memory per vCPU) and expose ports to reach network services running inside the sandbox:

```typescript
const sandbox = new VercelSandbox({
  runtime: 'node24',
  resources: { vcpus: 4 },
  ports: [3000],
})

const workspace = new Workspace({ sandbox })
await sandbox.start()

// The public HTTPS domain for an exposed port is available via getInfo()
const { metadata } = sandbox.getInfo()
console.log(metadata?.domains) // { 3000: 'https://....vercel.run' }
```

### Streaming output

Stream command output in real time via `onStdout` and `onStderr` callbacks:

```typescript
await sandbox.executeCommand('sh', ['-c', 'for i in 1 2 3; do echo "line $i"; sleep 1; done'], {
  onStdout: chunk => process.stdout.write(chunk),
  onStderr: chunk => process.stderr.write(chunk),
})
```

Both callbacks are optional and can be used independently.

## Constructor parameters

**id** (`string`): Unique identifier for this sandbox instance. (Default: `Auto-generated`)

**sandboxName** (`string`): Optional name passed to the Vercel API. Auto-generated if omitted.

**token** (`string`): Vercel API token. Falls back to the VERCEL\_TOKEN environment variable. Omit to use the OIDC token.

**teamId** (`string`): Vercel team ID. Falls back to the VERCEL\_TEAM\_ID environment variable.

**projectId** (`string`): Vercel project ID. Falls back to the VERCEL\_PROJECT\_ID environment variable.

**runtime** (`'node24' | 'node22' | 'node26' | 'python3.13'`): Sandbox runtime. (Default: `'node24'`)

**timeout** (`number`): Timeout in milliseconds before the sandbox auto-terminates. (Default: `300000 (5 minutes)`)

**resources** (`{ vcpus?: number }`): Resource allocation. Each vCPU comes with 2048 MB of memory.

**ports** (`number[]`): Ports to expose from the sandbox (up to 15). Public HTTPS domains are available via getInfo().metadata.domains.

**env** (`Record<string, string>`): Default environment variables inherited by all commands. (Default: `{}`)

**metadata** (`Record<string, unknown>`): Custom metadata surfaced via getInfo(). (Default: `{}`)

**instructions** (`string | ((opts) => string)`): Override the default instructions returned by getInstructions(). Pass a string to replace them, or a function to extend the defaults.

**onStart** (`SandboxLifecycleHook`): Lifecycle hook called after the sandbox reaches running status.

**onStop** (`SandboxLifecycleHook`): Lifecycle hook called before the sandbox stops.

**onDestroy** (`SandboxLifecycleHook`): Lifecycle hook called before the sandbox is destroyed.

## Properties

**id** (`string`): Sandbox instance identifier.

**name** (`'VercelSandbox'`): Human-readable name.

**provider** (`'vercel-sandbox'`): Provider type identifier.

**status** (`ProviderStatus`): 'pending' | 'starting' | 'running' | 'stopping' | 'stopped' | 'destroying' | 'destroyed' | 'error'

**sandbox** (`Sandbox`): The underlying @vercel/sandbox Sandbox instance. Throws SandboxNotReadyError if the sandbox has not been started.

**processes** (`VercelSandboxProcessManager`): Background process manager. See SandboxProcessManager reference.

## Background processes

`VercelSandbox` includes a process manager for spawning and managing background processes. Each spawned process runs as a detached command inside the MicroVM, with output streamed through the command logs.

```typescript
const sandbox = new VercelSandbox({ runtime: 'node24', ports: [3000] })
await sandbox.start()

const handle = await sandbox.processes.spawn('node server.js', {
  env: { PORT: '3000' },
  onStdout: data => console.log(data),
})

console.log(handle.stdout)
await handle.kill()
```

See the [`SandboxProcessManager` reference](https://mastra.ai/reference/workspace/process-manager) for the full API.

> **Note:** The Vercel Sandbox SDK doesn't expose a stdin channel for running commands, so `handle.sendStdin()` throws. Filesystem mounting (FUSE) is also not supported by this provider.

## Limits

- Up to 32 vCPUs, with 2048 MB of memory per vCPU.
- Up to 15 exposed ports.
- The filesystem is ephemeral. It's persisted only within the session and lost when the sandbox stops.
- Maximum runtime is plan-dependent (45 minutes on Hobby, up to 24 hours on Pro and Enterprise), with a default of 5 minutes.

See the [Vercel Sandbox documentation](https://vercel.com/docs/vercel-sandbox) for current limits and pricing.