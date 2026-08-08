> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# VercelServerlessSandbox

Executes commands as [Vercel](https://vercel.com) serverless functions. Provides globally distributed, zero-infrastructure execution with automatic scaling. For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

> **Warning:** VercelServerlessSandbox is stateless. It doesn't provide a persistent filesystem, interactive shell, or long-running background processes. Only `/tmp` is writable, and it's ephemeral between invocations.

> **Note:** For a full Linux MicroVM with a persistent filesystem, `sudo` access, exposed ports, and background processes, use [`VercelSandbox`](https://mastra.ai/reference/workspace/vercel-sandbox), which is backed by the [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) product.

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

## Usage

Add a `VercelServerlessSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { VercelServerlessSandbox } from '@mastra/vercel'

const workspace = new Workspace({
  sandbox: new VercelServerlessSandbox({
    token: process.env.VERCEL_TOKEN,
  }),
})

const agent = new Agent({
  id: 'dev-agent',
  name: 'dev-agent',
  instructions: 'You are a coding assistant working in this workspace.',
  model: 'anthropic/claude-sonnet-4-6',
  workspace,
})
```

### Team-scoped deployment with custom resources

```typescript
const workspace = new Workspace({
  sandbox: new VercelServerlessSandbox({
    token: process.env.VERCEL_TOKEN,
    teamId: 'team_abc123',
    regions: ['iad1', 'sfo1'],
    maxDuration: 120,
    memory: 3008,
    env: {
      NODE_ENV: 'production',
    },
  }),
})
```

## Constructor parameters

**token** (`string`): Vercel API token. Falls back to VERCEL\_TOKEN environment variable.

**teamId** (`string`): Vercel team ID for team-scoped deployments.

**projectName** (`string`): Existing Vercel project name. Auto-generated if omitted.

**regions** (`string[]`): Deployment regions. (Default: `['iad1']`)

**maxDuration** (`number`): Function maximum duration in seconds. (Default: `60`)

**memory** (`number`): Function memory in MB. (Default: `1024`)

**env** (`Record<string, string>`): Environment variables baked into the deployed function source. These are embedded at deploy time, not set dynamically.

**commandTimeout** (`number`): Per-invocation command timeout in milliseconds. (Default: `55000`)

**instructions** (`string | ((opts) => string)`): Custom instructions that override the default instructions returned by getInstructions(). Pass a string to fully replace, or a function to extend the defaults.

**onStart** (`SandboxLifecycleHook`): Lifecycle hook called after the sandbox reaches running status.

**onStop** (`SandboxLifecycleHook`): Lifecycle hook called before the sandbox stops.

**onDestroy** (`SandboxLifecycleHook`): Lifecycle hook called before the sandbox is destroyed.

## Properties

**id** (`string`): Unique identifier for this sandbox instance.

**name** (`'VercelServerlessSandbox'`): Human-readable name.

**provider** (`'vercel-serverless'`): Provider type identifier.

**status** (`ProviderStatus`): Current lifecycle status: 'pending', 'starting', 'running', 'stopping', 'stopped', 'destroying', 'destroyed', or 'error'.

## Limitations

VercelServerlessSandbox uses serverless functions under the hood, which means:

- **No persistent filesystem**: Files written to `/tmp` are ephemeral and cleared between invocations.
- **No interactive shell**: Commands run via `/bin/sh -c` with no stdin streaming.
- **No background processes**: No process manager, PIDs, or long-running tasks.
- **No mounting**: Cloud storage mounting (S3, GCS) isn't supported.
- **Timeout limits**: Maximum execution time is bounded by `maxDuration` (default 60s).

## Related

- [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox)
- [Workspace class](https://mastra.ai/reference/workspace/workspace-class)
- [E2BSandbox](https://mastra.ai/reference/workspace/e2b-sandbox): Full-featured cloud sandbox with persistent filesystem and process management