> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# PlatformSandbox

Client for provisioning sandboxes in a Mastra Platform environment. Each `PlatformSandbox` instance owns one remote sandbox: `start()` provisions it, `executeCommand()` runs against it, and `destroy()` tears it down. Construct additional instances to own additional remote sandboxes. Use `clone()` to derive them from a configured template (see [Cloning](#cloning-for-a-fleet-of-sandboxes)).

Sandboxes boot from a pre-built recipe checkpoint with Python 3, Node 22, TypeScript, tsx, and common build tooling already installed. Pass a stable `id` to opt into [checkpoint recovery](#checkpoint-recovery) so a new sandbox boots from the previous one's filesystem.

Related providers: [`RailwaySandbox`](https://mastra.ai/reference/workspace/railway-sandbox) for self-hosted Railway sandboxes, [`LocalSandbox`](https://mastra.ai/reference/workspace/local-sandbox) for local sandboxes.

> **Info:** For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

## Installation

**npm**:

```bash
npm install @mastra/platform-workspace
```

**pnpm**:

```bash
pnpm add @mastra/platform-workspace
```

**Yarn**:

```bash
yarn add @mastra/platform-workspace
```

**Bun**:

```bash
bun add @mastra/platform-workspace
```

Configure the platform credentials. The access token, project ID, and environment ID fall back to environment variables, so a Mastra Platform deployment can pass zero constructor options.

**.env file**:

```bash
MASTRA_PLATFORM_ACCESS_TOKEN=your-platform-access-token
MASTRA_PROJECT_ID=your-project-id
MASTRA_ENVIRONMENT_ID=your-environment-id
```

**Constructor**:

```typescript
new PlatformSandbox({
  accessToken: 'your-platform-access-token',
  projectId: 'your-project-id',
  environmentId: 'your-environment-id',
})
```

On a Mastra Platform deployment, `MASTRA_PLATFORM_ACCESS_TOKEN`, `MASTRA_PROJECT_ID`, and `MASTRA_ENVIRONMENT_ID` are injected automatically, so the constructor can be called with no options. For local development, `MASTRA_PLATFORM_ACCESS_TOKEN` can contain an `sk_` API token from your organization's settings page under **API Tokens**.

## Usage

Add a `PlatformSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { PlatformSandbox } from '@mastra/platform-workspace'

const workspace = new Workspace({
  sandbox: new PlatformSandbox({
    // accessToken, projectId, environmentId all fall back to env vars
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

Set `networkIsolation` to `PRIVATE` to join the environment's private network and reach other services running in the same Mastra Platform environment:

```typescript
const workspace = new Workspace({
  sandbox: new PlatformSandbox({
    networkIsolation: 'PRIVATE',
  }),
})
```

The default `ISOLATED` mode allows outbound internet access only, with no private network connectivity.

### Reattaching to a running sandbox

Pass an existing `sandboxId` to reattach to a live sandbox instead of creating a new one:

```typescript
const sandbox = new PlatformSandbox({
  sandboxId: 'sbx_abc123',
})
await sandbox.start()

const result = await sandbox.executeCommand('cat', ['/workspace/state.json'])
```

When `sandboxId` is set, `environmentId` isn't required because the sandbox already exists.

### Checkpoint recovery

The constructor `id` (explicit or auto-generated) is sent to the platform on `POST /sandbox` as an advisory recovery key:

- If the platform recognises the `id` from a previous session, the new sandbox boots from the most recent checkpoint of that earlier sandbox's filesystem instead of the base recipe.
- If the `id` isn't recognised, the platform starts a fresh sandbox from the base recipe. Auto-generated ids never match, so omitting `id` disables checkpoint recovery.

Pass a stable `id` to preserve a sandbox's filesystem across sessions or across a `destroy()`/`start()` cycle:

```typescript
const sandbox = new PlatformSandbox({
  id: `project-${projectId}`,
})
await sandbox.start() // Boots from the most recent checkpoint for this id, or fresh if unknown
```

Checkpoint recovery is coarser than `sandboxId` reattachment. Reattaching (via `sandboxId`) rejoins the exact live sandbox and its running processes. Checkpoint recovery constructs a brand new sandbox and restores its filesystem from the latest checkpoint the platform captured for the previous sandbox with that `id`. Running processes and any filesystem writes made after the last checkpoint aren't restored.

Each `id` maps to one independent filesystem. Reusing the same `id` across unrelated sandboxes causes the platform to boot them from each other's checkpoint.

### Cloning for a fleet of sandboxes

`clone()` returns an independent sibling `PlatformSandbox` that inherits credentials and defaults (access token, project, environment, network isolation, timeout, instructions, env, idle timeout) with per-instance overrides. The returned sandbox is unstarted and provisions on its own `start()`, so `clone()` performs no I/O:

```typescript
const template = new PlatformSandbox({
  networkIsolation: 'PRIVATE',
  idleTimeoutMinutes: 30,
})

const perProject = template.clone({ id: `project-${projectId}` })
await perProject.start()
```

Combine `clone()` with a stable `id` per clone to opt each clone into [checkpoint recovery](#checkpoint-recovery) independently.

### Executing commands

`executeCommand` runs a command on the remote sandbox and returns its output. Pass `args` to have arguments safely shell-quoted:

```typescript
const result = await sandbox.executeCommand('python', ['analyze.py'], {
  timeout: 30_000,
  cwd: '/workspace',
  env: { INPUT: 'repo' },
})

console.log(result.stdout)
console.log(result.exitCode)
```

> **Warning:** The `command` argument is a shell string and is concatenated verbatim into the remote shell. This lets you use pipes, redirects, and chaining (`ls -la | grep foo`) but means untrusted input must be passed through `args` (safely quoted) or shell-quoted by the caller. Untrusted `command` values allow arbitrary shell execution on the sandbox.

## Constructor parameters

**accessToken** (`string`): Platform access token. Falls back to the MASTRA\_PLATFORM\_ACCESS\_TOKEN environment variable.

**projectId** (`string`): Platform project ID. Falls back to the MASTRA\_PROJECT\_ID environment variable.

**environmentId** (`string`): Platform environment ID the sandbox belongs to. Falls back to the MASTRA\_ENVIRONMENT\_ID environment variable. Required unless sandboxId is passed.

**sandboxId** (`string`): Existing sandbox ID to reattach to instead of creating a new sandbox. When set, environmentId is not required.

**idleTimeoutMinutes** (`number`): How long the sandbox stays alive with no activity before the platform destroys it.

**networkIsolation** (`'ISOLATED' | 'PRIVATE'`): Network mode. 'ISOLATED' (default) allows outbound internet only. 'PRIVATE' joins the platform environment's private network.

**env** (`Record<string, string>`): Environment variables baked into the sandbox at creation time. Per-command environment variables can also be passed to executeCommand.

**timeout** (`number`): Default command execution timeout in milliseconds. Overridable per call via ExecuteCommandOptions.timeout.

**instructions** (`string | ((opts: { defaultInstructions: string; requestContext?: RequestContext }) => string)`): Custom instructions returned by getInstructions(). A string fully replaces the defaults; a function receives the defaults and can extend or customize them per-request.

**id** (`string`): Unique identifier for this sandbox instance. Sent to the platform as an advisory recovery key: if the platform recognizes the id from a previous sandbox, the new sandbox boots from that sandbox's most recent checkpoint instead of the base recipe. Unknown ids fall through to a fresh sandbox. Auto-generated when omitted, which disables checkpoint recovery. (Default: `Auto-generated`)

**fetch** (`typeof fetch`): Custom fetch implementation, mainly for testing.

## Properties

**id** (`string`): Sandbox instance identifier.

**name** (`string`): Provider name ('PlatformSandbox').

**provider** (`string`): Provider identifier ('platform').

**status** (`ProviderStatus`): 'pending' | 'initializing' | 'ready' | 'starting' | 'running' | 'stopping' | 'stopped' | 'destroying' | 'destroyed' | 'error'.

**processes** (`PlatformProcessManager`): Background process manager. See SandboxProcessManager reference.

## Methods

**start** (`() => Promise<void>`): Provision the remote sandbox, or reattach when sandboxId was passed to the constructor. Idempotent once the sandbox is running. A destroyed reattach target falls through to a fresh provision.

**destroy** (`() => Promise<void>`): Tear down the remote sandbox and clear the cached exec lease. A subsequent start() provisions a fresh sandbox (or restores from checkpoint when a stable id is set).

**stop** (`() => Promise<void>`): Alias for destroy().

**executeCommand** (`(command: string, args?: string[], options?: ExecuteCommandOptions) => Promise<CommandResult>`): Run a command on the remote sandbox and return its stdout, stderr, exitCode, and executionTimeMs. command is a shell string, args are safely shell-quoted.

**clone** (`(options?: SandboxCloneOptions) => PlatformSandbox`): Construct an unstarted sibling PlatformSandbox that inherits credentials and defaults with per-instance overrides (id, sandboxId, env, idleTimeoutMinutes). Performs no I/O. Use to build a fleet of independent sandboxes from one configured template.

**getInfo** (`() => Promise<SandboxInfo>`): Return the sandbox's platform id, provider, status, createdAt, and metadata (sandboxId, providerResourceId, platformStatus).

**getInstructions** (`(opts?: { requestContext?: RequestContext }) => string`): Return the sandbox instructions the workspace surfaces in tool descriptions. Honors the instructions constructor option; otherwise returns platform-default instructions that include the current remote sandbox id when running.

## Errors

Platform API failures raise `PlatformApiError`. Structured `{ error: { message, type } }` responses are parsed into `.code` (machine-readable kind) and `.proxyMessage` (human string); the raw response body stays available on `.body`:

```typescript
import { PlatformApiError } from '@mastra/platform-workspace'

try {
  await sandbox.executeCommand('cat', ['/missing.txt'])
} catch (err) {
  if (err instanceof PlatformApiError) {
    if (err.code === 'not_found') {
      // handle missing resource
    } else if (err.code === 'authentication_error') {
      // refresh token
    }
    console.error(err.status, err.code, err.proxyMessage)
  }
}
```

`code` and `proxyMessage` are `undefined` when the response body isn't JSON, for example an HTML 502 from a load balancer.

`executeCommand` runs over the direct-exec data plane (a WebSocket to the Railway tcp-proxy) and can also throw two typed sandbox errors on unrecoverable failure:

```typescript
import { SandboxDestroyedError, SandboxExecTransportError } from '@mastra/platform-workspace'

try {
  await sandbox.executeCommand('pytest')
} catch (err) {
  if (err instanceof SandboxDestroyedError) {
    // /exec-lease returned 410; the sandbox has been destroyed.
    // The cached sandbox id and lease have already been cleared,
    // so reusing the instance will reprovision on the next call.
  } else if (err instanceof SandboxExecTransportError) {
    // Both the initial WebSocket attempt and the built-in retry
    // closed without an exit frame against a live sandbox.
    console.error(err.closeCode, err.closeReason, err.wsEndpoint)
  }
}
```

`SandboxExecTransportError` carries diagnostic fields (`opened`, `closeCode`, `closeReason`, `wsEndpoint`, plus `sandboxId`, `command`, and `attempts`) so operators can distinguish a broken Railway data plane from a failed command.

## Related

- [PlatformFilesystem reference](https://mastra.ai/reference/workspace/platform-filesystem)
- [RailwaySandbox reference](https://mastra.ai/reference/workspace/railway-sandbox)
- [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox)
- [SandboxProcessManager reference](https://mastra.ai/reference/workspace/process-manager)