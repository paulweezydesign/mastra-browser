> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# PlatformFilesystem

Stores files in a Mastra Platform workspace bucket. Each Mastra Platform environment can have one bucket, and `PlatformFilesystem` gives agents `read`, `write`, `list`, `delete`, and `move` operations against it.

Related providers: [`S3Filesystem`](https://mastra.ai/reference/workspace/s3-filesystem) for direct S3 access, [`LocalFilesystem`](https://mastra.ai/reference/workspace/local-filesystem) for local directories.

> **Info:** For interface details, see [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem).

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

Configure the platform credentials. The access token, project ID, and bucket name fall back to environment variables, so a Mastra Platform deployment can pass zero constructor options.

**.env file**:

```bash
MASTRA_PLATFORM_ACCESS_TOKEN=your-platform-access-token
MASTRA_PROJECT_ID=your-project-id
MASTRA_PLATFORM_BUCKET_NAME=your-bucket-name
```

**Constructor**:

```typescript
new PlatformFilesystem({
  accessToken: 'your-platform-access-token',
  projectId: 'your-project-id',
  bucketName: 'your-bucket-name',
})
```

On a Mastra Platform deployment, `MASTRA_PLATFORM_ACCESS_TOKEN`, `MASTRA_PROJECT_ID`, and `MASTRA_PLATFORM_BUCKET_NAME` are injected automatically, so the constructor can be called with no options. For local development, `MASTRA_PLATFORM_ACCESS_TOKEN` can contain an `sk_` API token from your organization's settings page under **API Tokens**.

## Usage

Add a `PlatformFilesystem` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { PlatformFilesystem } from '@mastra/platform-workspace'

const workspace = new Workspace({
  filesystem: new PlatformFilesystem({
    // accessToken, projectId, bucketName all fall back to env vars
  }),
})

const agent = new Agent({
  id: 'file-agent',
  name: 'File Agent',
  instructions: 'You are a research assistant that reads and writes reports.',
  model: 'anthropic/claude-sonnet-4-6',
  workspace,
})
```

### Reading and writing files

Object keys are percent-encoded per segment, so filenames with `?`, `#`, `%`, `&`, `+`, or spaces are preserved end-to-end:

```typescript
const fs = new PlatformFilesystem()

await fs.writeFile('/analyses/repo.md', markdown)
const content = await fs.readFile('/analyses/repo.md')
const entries = await fs.readdir('/analyses')
await fs.moveFile('/analyses/repo.md', '/analyses/repo-final.md')
```

### Read-only mode

Pass `readOnly: true` to mount the bucket read-only. Any mutating call throws `WorkspaceReadOnlyError`:

```typescript
const fs = new PlatformFilesystem({ readOnly: true })

await fs.readFile('/analyses/repo.md') // ok
await fs.writeFile('/analyses/repo.md', 'x') // throws WorkspaceReadOnlyError
```

### Overwrite semantics

`writeFile` supports `overwrite: false` and throws `FileExistsError` when the destination already exists.

`copyFile` and `moveFile` always overwrite the destination. Passing `overwrite: false` to either method throws an error rather than silently overwriting.

### Appending files

`appendFile` is a read-modify-write and isn't atomic. Concurrent appends to the same path can overwrite each other. For concurrent writers, use `writeFile` with distinct keys.

## Constructor parameters

**accessToken** (`string`): Platform access token. Falls back to the MASTRA\_PLATFORM\_ACCESS\_TOKEN environment variable.

**projectId** (`string`): Platform project ID. Falls back to the MASTRA\_PROJECT\_ID environment variable.

**bucketName** (`string`): Platform bucket name to store files in. Falls back to the MASTRA\_PLATFORM\_BUCKET\_NAME environment variable.

**readOnly** (`boolean`): When true, all mutating calls throw WorkspaceReadOnlyError. (Default: `false`)

**displayName** (`string`): Human-readable name shown in workspace UIs.

**description** (`string`): Short description shown in workspace UIs.

**icon** (`FilesystemIcon`): Icon shown in workspace UIs.

**instructions** (`string | ((opts: { defaultInstructions: string; requestContext?: RequestContext }) => string)`): Custom instructions returned by getInstructions(). A string fully replaces the defaults; a function receives the defaults and can extend or customize them per-request.

**id** (`string`): Unique identifier for this filesystem instance. (Default: `Auto-generated`)

**fetch** (`typeof fetch`): Custom fetch implementation, mainly for testing.

## Properties

**id** (`string`): Filesystem instance identifier.

**name** (`string`): Provider name ('PlatformFilesystem').

**provider** (`string`): Provider identifier ('platform').

**readOnly** (`boolean | undefined`): Whether the filesystem was mounted read-only.

## Errors

Filesystem-specific errors match the standard workspace error types:

- `FileNotFoundError`: The path doesn't exist. Thrown by `readFile`, `stat`, and `deleteFile` (unless `force: true` is set).
- `FileExistsError`: `writeFile` was called with `overwrite: false` and the destination already exists.
- `WorkspaceReadOnlyError`: A mutating call was made on a read-only filesystem.

Other Platform API failures raise `PlatformApiError`. Structured `{ error: { message, type } }` responses are parsed into `.code` (machine-readable kind) and `.proxyMessage` (human string):

```typescript
import { FileNotFoundError } from '@mastra/core/workspace'
import { PlatformApiError } from '@mastra/platform-workspace'

try {
  await fs.readFile('/missing.txt')
} catch (err) {
  if (err instanceof FileNotFoundError) {
    // handle missing file
  } else if (err instanceof PlatformApiError) {
    if (err.code === 'authentication_error') {
      // refresh token
    }
    console.error(err.status, err.code, err.proxyMessage)
  }
}
```

`FileNotFoundError`, `FileExistsError`, and `WorkspaceReadOnlyError` are re-exports of the standard workspace error types from `@mastra/core/workspace`. `PlatformApiError` is specific to `@mastra/platform-workspace`.

`code` and `proxyMessage` are `undefined` when the response body isn't JSON, for example an HTML 502 from a load balancer.

## Related

- [PlatformSandbox reference](https://mastra.ai/reference/workspace/platform-sandbox)
- [S3Filesystem reference](https://mastra.ai/reference/workspace/s3-filesystem)
- [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem)