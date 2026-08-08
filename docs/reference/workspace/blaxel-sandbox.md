> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# BlaxelSandbox

Executes commands in isolated [Blaxel](https://blaxel.ai/) cloud sandboxes. Provides secure, isolated code execution environments with support for mounting cloud storage (S3, GCS) via FUSE. For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

## Installation

**npm**:

```bash
npm install @mastra/blaxel
```

**pnpm**:

```bash
pnpm add @mastra/blaxel
```

**Yarn**:

```bash
yarn add @mastra/blaxel
```

**Bun**:

```bash
bun add @mastra/blaxel
```

## Usage

Add a `BlaxelSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { BlaxelSandbox } from '@mastra/blaxel'

const workspace = new Workspace({
  sandbox: new BlaxelSandbox(),
})

const agent = new Agent({
  id: 'code-agent',
  name: 'Code Agent',
  instructions: 'You are a coding assistant working in this workspace.',
  model: 'anthropic/claude-sonnet-4-6',
  workspace,
})
```

### Custom image with resources

Use a custom Docker image with additional memory:

```typescript
const workspace = new Workspace({
  sandbox: new BlaxelSandbox({
    image: 'node:20-slim',
    memory: 8192,
    region: 'auto',
    timeout: '10m',
  }),
})
```

## Constructor parameters

**id** (`string`): Unique identifier for this sandbox instance. (Default: `Auto-generated`)

**image** (`string`): Docker image to use for the sandbox. Debian-based images support both S3 and GCS mounts. Alpine-based images support S3 mounts only. (Default: `'blaxel/ts-app:latest'`)

**memory** (`number`): Memory allocation in MB. (Default: `4096`)

**timeout** (`string`): Execution timeout as a duration string (e.g. '5m', '1h'). Maps to the Blaxel sandbox TTL.

**region** (`string`): Blaxel region where the sandbox should be created. Use 'auto' to choose a region automatically, or set a concrete region like 'us-pdx-1'. (Default: `process.env.BL_REGION || 'auto'`)

**env** (`Record<string, string>`): Environment variables to set in the sandbox.

**labels** (`Record<string, string>`): Custom labels for the sandbox.

**runtimes** (`SandboxRuntime[]`): Supported runtimes. Valid values: 'node', 'python', 'bash', 'ruby', 'go', 'rust', 'java', 'cpp', 'r'. (Default: `['node', 'python', 'bash']`)

**ports** (`Array<{ name?: string; target: number; protocol?: 'HTTP' | 'TCP' | 'UDP' }>`): Ports to expose from the sandbox.

## Properties

**id** (`string`): Sandbox instance identifier.

**name** (`string`): 'BlaxelSandbox'

**provider** (`string`): 'blaxel'

**status** (`ProviderStatus`): 'pending' | 'initializing' | 'running' | 'stopped' | 'error'

**instance** (`SandboxInstance`): The underlying Blaxel SandboxInstance for direct access to Blaxel APIs. Throws SandboxNotReadyError if the sandbox has not been started.

**processes** (`BlaxelProcessManager`): Background process manager. See SandboxProcessManager reference.

## Background processes

`BlaxelSandbox` includes a built-in process manager for spawning and managing background processes.

```typescript
const sandbox = new BlaxelSandbox({ id: 'dev-sandbox' })
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

> **Note:** Blaxel sandboxes don't support stdin. Calling `handle.sendStdin()` throws an error.

See [`SandboxProcessManager` reference](https://mastra.ai/reference/workspace/process-manager) for the full API.

## Mounting cloud storage

Blaxel sandboxes can mount S3 or GCS filesystems, making cloud storage accessible as a local directory inside the sandbox.

### S3

```typescript
import { Workspace } from '@mastra/core/workspace'
import { S3Filesystem } from '@mastra/s3'
import { BlaxelSandbox } from '@mastra/blaxel'

const workspace = new Workspace({
  mounts: {
    '/data': new S3Filesystem({
      bucket: 'my-bucket',
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
  },
  sandbox: new BlaxelSandbox(),
})
```

### GCS

```typescript
import { Workspace } from '@mastra/core/workspace'
import { GCSFilesystem } from '@mastra/gcs'
import { BlaxelSandbox } from '@mastra/blaxel'

const workspace = new Workspace({
  mounts: {
    '/data': new GCSFilesystem({
      bucket: 'my-bucket',
      credentials: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY!),
    }),
  },
  sandbox: new BlaxelSandbox(),
})
```