> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# AzureBlobFilesystem

Stores files in Azure Blob Storage containers. For interface details, see [WorkspaceFilesystem Interface](https://mastra.ai/reference/workspace/filesystem).

## Installation

**npm**:

```bash
npm install @mastra/azure
```

**pnpm**:

```bash
pnpm add @mastra/azure
```

**Yarn**:

```bash
yarn add @mastra/azure
```

**Bun**:

```bash
bun add @mastra/azure
```

## Usage

Add an `AzureBlobFilesystem` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { AzureBlobFilesystem } from '@mastra/azure/blob'

const workspace = new Workspace({
  filesystem: new AzureBlobFilesystem({
    container: 'my-container',
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  }),
})

const agent = new Agent({
  id: 'file-agent',
  name: 'file-agent',
  model: 'anthropic/claude-opus-4-7',
  workspace,
})
```

### Account key

Use an account name and account key when you don't want to pass a full connection string:

```typescript
import { AzureBlobFilesystem } from '@mastra/azure/blob'

const filesystem = new AzureBlobFilesystem({
  container: 'my-container',
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
})
```

### Shared access signature token

Use a shared access signature (SAS) token with either `accountName` or `endpoint`:

```typescript
import { AzureBlobFilesystem } from '@mastra/azure/blob'

const filesystem = new AzureBlobFilesystem({
  container: 'my-container',
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  sasToken: process.env.AZURE_STORAGE_SAS_TOKEN,
})
```

### DefaultAzureCredential

Use `DefaultAzureCredential` when your environment provides Azure identity credentials:

```typescript
import { AzureBlobFilesystem } from '@mastra/azure/blob'

const filesystem = new AzureBlobFilesystem({
  container: 'my-container',
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  useDefaultCredential: true,
})
```

Install `@azure/identity` when you use `DefaultAzureCredential`:

**npm**:

```bash
npm install @azure/identity
```

**pnpm**:

```bash
pnpm add @azure/identity
```

**Yarn**:

```bash
yarn add @azure/identity
```

**Bun**:

```bash
bun add @azure/identity
```

## Constructor parameters

**container** (`string`): Azure Blob Storage container name

**connectionString** (`string`): Full Azure Storage connection string. Takes priority over other authentication options.

**accountName** (`string`): Azure Storage account name. Required unless you use connectionString or endpoint.

**accountKey** (`string`): Azure Storage account key.

**sasToken** (`string`): Shared access signature token. Requires accountName or endpoint.

**useDefaultCredential** (`boolean`): Use DefaultAzureCredential from @azure/identity. (Default: `false`)

**endpoint** (`string`): Custom Blob service endpoint URL. Used for local development with Azurite.

**prefix** (`string`): Optional prefix for all keys (acts like a subdirectory).

**id** (`string`): Unique identifier for this filesystem instance. (Default: `Auto-generated`)

**displayName** (`string`): Human-friendly display name for the UI.

**icon** (`FilesystemIcon`): Icon identifier for the UI.

**description** (`string`): Short description of this filesystem for the UI.

**readOnly** (`boolean`): When true, all write operations are blocked. (Default: `false`)

## Properties

**id** (`string`): Filesystem instance identifier.

**name** (`string`): Provider name ('AzureBlobFilesystem').

**provider** (`string`): Provider identifier ('azure-blob').

**readOnly** (`boolean | undefined`): Whether the filesystem is in read-only mode.

## Methods

AzureBlobFilesystem implements the [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem), providing all standard filesystem methods:

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

Initialize the filesystem. Verifies container access and credentials.

```typescript
await filesystem.init()
```

### `getInfo()`

Returns metadata about this filesystem instance.

```typescript
const info = filesystem.getInfo()
// { id: '...', name: 'AzureBlobFilesystem', provider: 'azure-blob', status: 'ready' }
```

### `getContainer()`

Returns the underlying Azure Blob Storage `ContainerClient`.

```typescript
const container = await filesystem.getContainer()
```

### `getMountConfig()`

Returns the mount configuration for sandbox providers that support Azure Blob filesystem mounts.

```typescript
const config = filesystem.getMountConfig()
// { type: 'azure-blob', container: 'my-container', ... }
```

> **Note:** Azure Blob sandbox mounting depends on sandbox support for `azure-blob` mount configs. Use `filesystem` for direct workspace file operations when your sandbox provider doesn't support Azure Blob mounts.

## Related

- [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem)
- [S3Filesystem reference](https://mastra.ai/reference/workspace/s3-filesystem)
- [GCSFilesystem reference](https://mastra.ai/reference/workspace/gcs-filesystem)
- [Workspace overview](https://mastra.ai/docs/workspace/overview)