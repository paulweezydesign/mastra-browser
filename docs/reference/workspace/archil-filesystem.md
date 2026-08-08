> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# ArchilFilesystem

Stores files on [Archil](https://docs.archil.com) elastic, serverless disks. Combines an S3-compatible object API for fast reads/writes with `exec()` for POSIX shell operations and `grep()` for parallel server-side search. For interface details, see [WorkspaceFilesystem Interface](https://mastra.ai/reference/workspace/filesystem).

## Installation

**npm**:

```bash
npm install @mastra/archil
```

**pnpm**:

```bash
pnpm add @mastra/archil
```

**Yarn**:

```bash
yarn add @mastra/archil
```

**Bun**:

```bash
bun add @mastra/archil
```

## Usage

Add an `ArchilFilesystem` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { ArchilFilesystem } from '@mastra/archil'

const workspace = new Workspace({
  filesystem: new ArchilFilesystem({
    diskId: 'dsk-0123456789abcdef',
    apiKey: process.env.ARCHIL_API_KEY,
    region: 'aws-us-east-1',
  }),
})

const agent = new Agent({
  id: 'file-agent',
  name: 'file-agent',
  model: 'anthropic/claude-opus-4-7',
  workspace,
})
```

### Creating a new disk on init

If you don't have an existing disk, provide `createDiskOptions` to create one automatically:

```typescript
import { ArchilFilesystem } from '@mastra/archil'

const filesystem = new ArchilFilesystem({
  apiKey: process.env.ARCHIL_API_KEY,
  region: 'aws-us-east-1',
  createDiskOptions: {
    name: 'my-agent-workspace',
  },
})

await filesystem.init()
// filesystem.diskId now contains the newly created disk ID
```

### Environment variable fallbacks

When `apiKey` and `region` are omitted, the provider reads from environment variables:

- `ARCHIL_API_KEY` - API key
- `ARCHIL_REGION` - Region (e.g. `aws-us-east-1`)
- `ARCHIL_S3_BASE_URL` - Custom S3 endpoint (optional)

```typescript
import { ArchilFilesystem } from '@mastra/archil'

// Uses ARCHIL_API_KEY and ARCHIL_REGION from environment
const filesystem = new ArchilFilesystem({
  diskId: 'dsk-0123456789abcdef',
})
```

## Constructor parameters

**diskId** (`string`): Existing Archil disk ID (e.g. "dsk-0123456789abcdef"). Mutually exclusive with createDiskOptions.

**createDiskOptions** (`CreateDiskRequest`): Options for creating a new disk on init. Mutually exclusive with diskId.

**apiKey** (`string`): Archil API key. Falls back to ARCHIL\_API\_KEY environment variable.

**region** (`string`): Archil region (e.g. "aws-us-east-1"). Falls back to ARCHIL\_REGION environment variable.

**baseUrl** (`string`): Custom Archil control-plane URL (for testing or self-hosted deployments).

**s3BaseUrl** (`string`): Custom S3-compatible API URL. Falls back to ARCHIL\_S3\_BASE\_URL environment variable.

**id** (`string`): Unique identifier for this filesystem instance. (Default: `Auto-generated`)

**displayName** (`string`): Human-friendly display name for the UI.

**icon** (`FilesystemIcon`): Icon identifier for the UI.

**description** (`string`): Short description of this filesystem for the UI.

**readOnly** (`boolean`): When true, all write operations are blocked. (Default: `false`)

## Properties

**id** (`string`): Filesystem instance identifier.

**name** (`string`): Provider name ('ArchilFilesystem').

**provider** (`string`): Provider identifier ('archil').

**diskId** (`string | undefined`): The Archil disk ID (available after init).

**readOnly** (`boolean | undefined`): Whether the filesystem is in read-only mode.

## Methods

ArchilFilesystem implements the [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem), providing all standard filesystem methods:

- `readFile(path, options?)` - Read file contents
- `writeFile(path, content, options?)` - Write content to a file
- `appendFile(path, content)` - Append content to a file
- `deleteFile(path, options?)` - Delete a file
- `copyFile(src, dest, options?)` - Copy a file
- `moveFile(src, dest, options?)` - Move or rename a file
- `mkdir(path, options?)` - Create a directory
- `rmdir(path, options?)` - Remove a directory
- `readdir(path, options?)` - List directory contents
- `exists(path)` - Check if a path exists
- `stat(path)` - Get file or directory metadata

### `init()`

Initialize the filesystem. Connects to the existing disk or creates a new one.

```typescript
await filesystem.init()
```

### `getInfo()`

Returns metadata about this filesystem instance.

```typescript
const info = filesystem.getInfo()
// { id: '...', name: 'ArchilFilesystem', provider: 'archil', status: 'ready' }
```

### Archil-specific methods

#### `exec(command)`

Run a shell command on the disk. Returns exit code, stdout, and stderr.

```typescript
const result = await filesystem.exec('ls -la /data')
// { exitCode: 0, stdout: '...', stderr: '' }
```

#### `grep(options)`

Run a parallel server-side search across files on the disk.

```typescript
const results = await filesystem.grep({
  directory: '/logs',
  pattern: 'ERROR',
  recursive: true,
  glob: '*.log',
})
// { matches: [...], stoppedReason: null }
```

#### `share(path, options?)`

Generate a signed URL for sharing a file.

```typescript
const { url } = await filesystem.share('/reports/output.pdf', {
  expiresIn: 3600,
})
```

## Related

- [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem)
- [S3Filesystem reference](https://mastra.ai/reference/workspace/s3-filesystem)
- [GCSFilesystem reference](https://mastra.ai/reference/workspace/gcs-filesystem)
- [AzureBlobFilesystem reference](https://mastra.ai/reference/workspace/azure-blob-filesystem)
- [Archil documentation](https://docs.archil.com)