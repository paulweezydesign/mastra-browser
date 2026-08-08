> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# E2BSandbox

Executes commands in isolated [E2B](https://e2b.dev) cloud sandboxes. Provides secure, ephemeral environments with support for mounting cloud storage. For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

## Installation

**npm**:

```bash
npm install @mastra/e2b
```

**pnpm**:

```bash
pnpm add @mastra/e2b
```

**Yarn**:

```bash
yarn add @mastra/e2b
```

**Bun**:

```bash
bun add @mastra/e2b
```

## Usage

Add an `E2BSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { E2BSandbox } from '@mastra/e2b'

const workspace = new Workspace({
  sandbox: new E2BSandbox({
    id: 'dev-sandbox',
    timeout: 60_000, // 60 second timeout (default: 5 minutes)
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

**apiKey** (`string`): E2B API key. Falls back to E2B\_API\_KEY environment variable.

**timeout** (`number`): Execution timeout in milliseconds (Default: `300000 (5 minutes)`)

**template** (`string | TemplateBuilder | function`): Sandbox template specification. Can be a template ID string, a TemplateBuilder, or a function that customizes the default template.

**env** (`Record<string, string>`): Environment variables to set in the sandbox

**id** (`string`): Unique identifier for this sandbox instance (Default: `Auto-generated`)

**domain** (`string`): Domain for self-hosted E2B. Falls back to E2B\_DOMAIN env var.

**apiUrl** (`string`): API URL for self-hosted E2B. Falls back to E2B\_API\_URL env var.

**accessToken** (`string`): Access token for authentication. Falls back to E2B\_ACCESS\_TOKEN env var.

**metadata** (`Record<string, unknown>`): Custom metadata attached to the sandbox instance.

**instructions** (`string | ((opts: { defaultInstructions: string; requestContext?: RequestContext }) => string)`): Custom instructions returned by getInstructions(). A string fully replaces the defaults; a function receives the defaults and can extend or customize them per-request. Pass an empty string to suppress instructions entirely.

## Properties

**id** (`string`): Sandbox instance identifier

**name** (`string`): Provider name ('E2BSandbox')

**provider** (`string`): Provider identifier ('e2b')

**status** (`ProviderStatus`): 'pending' | 'initializing' | 'ready' | 'starting' | 'running' | 'stopping' | 'stopped' | 'destroying' | 'destroyed' | 'error'

**processes** (`E2BProcessManager`): Background process manager. See SandboxProcessManager reference.

## Background processes

`E2BSandbox` includes a built-in process manager for spawning and managing background processes. Processes run in the E2B cloud sandbox using the E2B SDK's `commands.run()` with `background: true`.

```typescript
const sandbox = new E2BSandbox({ id: 'dev-sandbox' })
await sandbox.start()

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

The E2B process manager supports reconnecting to processes that were spawned externally or before a reconnection. Call `get(pid)` with a PID to connect to an existing process:

```typescript
const handle = await sandbox.processes.get(existingPid)
if (handle) {
  console.log(handle.stdout)
}
```

See [`SandboxProcessManager` reference](https://mastra.ai/reference/workspace/process-manager) for the full API.

## Mounting cloud storage

E2B sandboxes can mount S3, GCS, and Azure Blob filesystems, making cloud storage accessible as local directories inside the sandbox. This is useful for:

- Processing large datasets stored in cloud buckets
- Writing output files directly to cloud storage
- Sharing data between sandbox sessions

### Using the mounts config

The simplest way to mount filesystems is through the workspace `mounts` config:

```typescript
import { Workspace } from '@mastra/core/workspace'
import { S3Filesystem } from '@mastra/s3'
import { GCSFilesystem } from '@mastra/gcs'
import { E2BSandbox } from '@mastra/e2b'

const workspace = new Workspace({
  mounts: {
    '/s3-data': new S3Filesystem({
      bucket: 'my-s3-bucket',
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
    '/gcs-data': new GCSFilesystem({
      bucket: 'my-gcs-bucket',
      projectId: 'my-project',
      credentials: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY),
    }),
  },
  sandbox: new E2BSandbox({ id: 'dev-sandbox' }),
})
```

When the sandbox starts, the filesystems are automatically mounted at the specified paths. Code running in the sandbox can then access files at `/s3-data` and `/gcs-data` as if they were local directories.

### How mounting works

E2B sandboxes use FUSE (Filesystem in Userspace) to mount cloud storage:

- **S3/R2**: Mounted via [s3fs-fuse](https://github.com/s3fs-fuse/s3fs-fuse)
- **GCS**: Mounted via [gcsfuse](https://github.com/GoogleCloudPlatform/gcsfuse)
- **Azure Blob**: Mounted via [blobfuse2](https://github.com/Azure/azure-storage-fuse)

The E2B sandbox automatically installs the required FUSE tools when mounting is used. For best performance, pre-build a custom template with the tools installed.

## Custom templates

By default, when no template is specified, E2BSandbox automatically builds a template with `s3fs` installed for S3 mounting support. This template is cached and reused across sandbox instances.

For GCS mounting, `gcsfuse` is automatically installed at mount time if not already present. For additional tools or faster cold starts, use custom templates.

### Using an existing template

If you have a pre-built template, pass its ID:

```typescript
const workspace = new Workspace({
  sandbox: new E2BSandbox({
    id: 'dev-sandbox',
    template: 'my-custom-template',
  }),
})
```

### Customizing the default template

Pass a function to customize the default mountable template. The function receives a `TemplateBuilder` and should return the modified template:

```typescript
const workspace = new Workspace({
  sandbox: new E2BSandbox({
    template: base =>
      base
        .aptInstall(['ffmpeg', 'imagemagick', 'poppler-utils'])
        .pipInstall(['pandas', 'numpy'])
        .npmInstall(['sharp']),
  }),
})
```

The template builder supports method chaining with operations like:

- `aptInstall(packages)` - Install system packages
- `pipInstall(packages)` - Install Python packages
- `npmInstall(packages)` - Install Node.js packages
- `runCmd(command)` - Run shell commands
- `setEnvs(vars)` - Set environment variables
- `copy(src, dest)` - Copy files into the template

See [E2B's template documentation](https://e2b.dev/docs/template/defining-template) for the full list of available methods.

### Pre-building templates

The default template is built on first use and cached. For faster cold starts or to include GCS support, you can pre-build a template:

```typescript
import { createDefaultMountableTemplate } from '@mastra/e2b'
import { Template } from 'e2b'

// Get the default mountable template (includes s3fs)
const { template, id } = createDefaultMountableTemplate()

// Build and save to E2B
const result = await Template.build(template, id)
console.log('Template ID:', result.templateId)

// Use this ID in your E2BSandbox config for instant startup
const sandbox = new E2BSandbox({
  template: result.templateId,
})
```

For faster GCS cold starts, pre-install `gcsfuse` in a custom template:

```typescript
const workspace = new Workspace({
  sandbox: new E2BSandbox({
    id: 'dev-sandbox',
    template: base => base.aptInstall(['gcsfuse']),
  }),
})
```

This is optional: `gcsfuse` is installed automatically at mount time if not present.

## Using with Code Mode

[Code Mode](https://mastra.ai/docs/agents/code-mode) lets an agent write a single TypeScript program that orchestrates its tools. Because E2B runs that program in a remote micro-VM, it needs a transport that writes the program into the sandbox filesystem rather than the host. `@mastra/e2b` provides `E2BCodeModeTransport` for this. Pass it as the second argument to `createCodeMode`:

```typescript
import { createCodeMode } from '@mastra/core/tools'
import { E2BSandbox, E2BCodeModeTransport } from '@mastra/e2b'

const { tool, instructions } = createCodeMode(
  {
    tools: { getWeather, getForecast },
    sandbox: new E2BSandbox({ timeout: 60_000 }),
  },
  new E2BCodeModeTransport(),
)
```

`E2BCodeModeTransport` auto-starts the sandbox if it isn't running, strips TypeScript on the host with esbuild (so it works regardless of the sandbox's Node version), runs `node` inside the VM, and cleans up the program files afterwards. The default `StdioCodeModeTransport` from `@mastra/core` only works with sandboxes that share the host filesystem, such as `LocalSandbox`.

## Related

- [SandboxProcessManager reference](https://mastra.ai/reference/workspace/process-manager)
- [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox)
- [LocalSandbox reference](https://mastra.ai/reference/workspace/local-sandbox)
- [S3Filesystem reference](https://mastra.ai/reference/workspace/s3-filesystem)
- [GCSFilesystem reference](https://mastra.ai/reference/workspace/gcs-filesystem)
- [Azure Blob Filesystem reference](https://mastra.ai/reference/workspace/azure-blob-filesystem)
- [Workspace overview](https://mastra.ai/docs/workspace/overview)