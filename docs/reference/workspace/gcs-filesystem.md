> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# GCSFilesystem

Stores files in Google Cloud Storage. For interface details, see [WorkspaceFilesystem Interface](https://mastra.ai/reference/workspace/filesystem).

## Installation

**npm**:

```bash
npm install @mastra/gcs
```

**pnpm**:

```bash
pnpm add @mastra/gcs
```

**Yarn**:

```bash
yarn add @mastra/gcs
```

**Bun**:

```bash
bun add @mastra/gcs
```

## Usage

Add a `GCSFilesystem` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { GCSFilesystem } from '@mastra/gcs'

const workspace = new Workspace({
  filesystem: new GCSFilesystem({
    bucket: 'my-gcs-bucket',
    projectId: 'my-project-id',
    credentials: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY),
  }),
})

const agent = new Agent({
  id: 'file-agent',
  name: 'file-agent',
  model: 'anthropic/claude-opus-4-7',
  workspace,
})
```

### Using Application Default Credentials

If running on Google Cloud or with `gcloud` CLI configured, you can omit credentials:

```typescript
import { GCSFilesystem } from '@mastra/gcs'

const filesystem = new GCSFilesystem({
  bucket: 'my-gcs-bucket',
  // Uses Application Default Credentials automatically
})
```

[Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) automatically discovers credentials in this order:

1. `GOOGLE_APPLICATION_CREDENTIALS` environment variable (path to a service account key file)
2. Default service account when running on GCP (Compute Engine, Cloud Run, GKE, etc.)
3. User credentials from `gcloud auth application-default login` (for local development)

### Using a Key File Path

You can also pass a path to a service account key file:

```typescript
import { GCSFilesystem } from '@mastra/gcs'

const filesystem = new GCSFilesystem({
  bucket: 'my-gcs-bucket',
  projectId: 'my-project-id',
  credentials: '/path/to/service-account-key.json',
})
```

## Constructor parameters

**bucket** (`string`): GCS bucket name

**projectId** (`string`): GCS project ID. Required when using service account credentials.

**credentials** (`object | string`): Service account key JSON object or path to key file. If not provided, uses Application Default Credentials.

**prefix** (`string`): Optional prefix for all keys (acts like a subdirectory)

**id** (`string`): Unique identifier for this filesystem instance (Default: `Auto-generated`)

**displayName** (`string`): Human-friendly display name for the UI

**icon** (`FilesystemIcon`): Icon identifier for the UI

**description** (`string`): Short description of this filesystem for the UI

**readOnly** (`boolean`): When true, all write operations are blocked (Default: `false`)

**endpoint** (`string`): Custom API endpoint URL. Used for local development with emulators.

## Properties

**id** (`string`): Filesystem instance identifier

**name** (`string`): Provider name ('GCSFilesystem')

**provider** (`string`): Provider identifier ('gcs')

**bucket** (`string`): The GCS bucket name

**readOnly** (`boolean | undefined`): Whether the filesystem is in read-only mode

## Methods

GCSFilesystem implements the [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem), providing all standard filesystem methods:

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

Initialize the filesystem. Verifies bucket access and credentials.

```typescript
await filesystem.init()
```

### `getInfo()`

Returns metadata about this filesystem instance.

```typescript
const info = filesystem.getInfo()
// { id: '...', name: 'GCSFilesystem', provider: 'gcs', status: 'ready' }
```

### `getMountConfig()`

Returns the mount configuration for sandboxes that support mounting this filesystem type.

```typescript
const config = filesystem.getMountConfig()
// { type: 'gcs', bucket: 'my-bucket', ... }
```

## Mounting in E2B sandboxes

GCSFilesystem can be mounted into E2B sandboxes, making the bucket accessible as a local directory:

```typescript
import { Workspace } from '@mastra/core/workspace'
import { GCSFilesystem } from '@mastra/gcs'
import { E2BSandbox } from '@mastra/e2b'

const workspace = new Workspace({
  mounts: {
    '/data': new GCSFilesystem({
      bucket: 'my-gcs-bucket',
      projectId: 'my-project-id',
      credentials: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY),
    }),
  },
  sandbox: new E2BSandbox({ id: 'dev-sandbox' }),
})
```

See [E2BSandbox reference](https://mastra.ai/reference/workspace/e2b-sandbox) for more details on mounting.

## Related

- [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem)
- [ArchilFilesystem reference](https://mastra.ai/reference/workspace/archil-filesystem)
- [S3Filesystem reference](https://mastra.ai/reference/workspace/s3-filesystem)
- [AzureBlobFilesystem reference](https://mastra.ai/reference/workspace/azure-blob-filesystem)
- [E2BSandbox reference](https://mastra.ai/reference/workspace/e2b-sandbox)
- [Workspace overview](https://mastra.ai/docs/workspace/overview)