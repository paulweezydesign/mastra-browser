> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# MesaFilesystem

Stores workspace files in [Mesa](https://docs.mesa.dev/content/getting-started/introduction) repos through the standard Mastra `WorkspaceFilesystem` interface.

Use `MesaFilesystem` when agents need versioned file storage. For a local directory, use [`LocalFilesystem`](https://mastra.ai/reference/workspace/local-filesystem). For object storage, use [`S3Filesystem`](https://mastra.ai/reference/workspace/s3-filesystem), [`GCSFilesystem`](https://mastra.ai/reference/workspace/gcs-filesystem), or [`AzureBlobFilesystem`](https://mastra.ai/reference/workspace/azure-blob-filesystem).

> **Info:** `MesaFilesystem` runs in the Mastra process.
>
> [Mesa's POSIX mount](https://docs.mesa.dev/content/mesafs/posix-mount) (for using a Mesa filesystem within a sandbox) isn't yet part of the `@mastra/mesa` package. Support is coming soon.

## Installation

**npm**:

```bash
npm install @mastra/mesa
```

**pnpm**:

```bash
pnpm add @mastra/mesa
```

**Yarn**:

```bash
yarn add @mastra/mesa
```

**Bun**:

```bash
bun add @mastra/mesa
```

## Usage example

Mount one Mesa repo and pass the filesystem to a workspace:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { MesaFilesystem } from '@mastra/mesa'

const workspace = new Workspace({
  filesystem: new MesaFilesystem({
    apiKey: process.env.MESA_API_KEY,
    org: 'acme',
    repos: [{ name: 'docs', bookmark: 'main' }],
  }),
})

const agent = new Agent({
  id: 'file-agent',
  name: 'file-agent',
  model: 'anthropic/claude-opus-4-7',
  workspace,
})
```

`apiKey` falls back to `MESA_API_KEY` when omitted.

## Constructor parameters

**apiKey** (`string`): Mesa API key. Falls back to MESA\_API\_KEY when omitted.

**org** (`string`): Mesa org slug. When omitted, the Mesa SDK resolves the default org.

**repos** (`RepoConfig[]`): Mesa repos to mount.

**cache** (`{ diskCache?: { path: string; maxSizeBytes?: number } }`): Mesa filesystem cache configuration.

**ttl** (`number`): Mesa mount token lifetime in seconds.

**readOnly** (`boolean`): Mount all repos as read-only. (Default: `false`)

## Properties

**id** (`string`): Filesystem instance identifier.

**name** (`string`): Provider name ('MesaFilesystem').

**provider** (`string`): Provider identifier ('mesa').

**readOnly** (`boolean | undefined`): Whether write operations are blocked.

**client** (`Mesa | undefined`): Mesa SDK client created by this provider. Undefined before initialization.

**filesystem** (`MesaFileSystem`): Active Mesa filesystem. Access this after initialization when you need the raw Mesa SDK filesystem.

**change** (`MesaFileSystem["change"]`): Mesa change management operations for the mounted filesystem.

**bookmark** (`MesaFileSystem["bookmark"]`): Mesa bookmark management operations for the mounted filesystem.

## Methods

`MesaFilesystem` implements the [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem).

### File operations

#### `readFile(path, options?)`

Reads a file from Mesa.

```typescript
const content = await filesystem.readFile('/acme/docs/README.md', {
  encoding: 'utf-8',
})
```

Returns: `Promise<string | Buffer>`

#### `writeFile(path, content, options?)`

Writes a file to Mesa.

```typescript
await filesystem.writeFile('/acme/docs/report.md', '# Report')
```

Returns: `Promise<void>`

#### `appendFile(path, content)`

Appends content to a file.

```typescript
await filesystem.appendFile('/acme/docs/log.txt', 'new line\n')
```

Returns: `Promise<void>`

#### `deleteFile(path, options?)`

Deletes a file.

```typescript
await filesystem.deleteFile('/acme/docs/old-report.md')
```

Returns: `Promise<void>`

#### `copyFile(src, dest, options?)`

Copies a file.

```typescript
await filesystem.copyFile('/acme/docs/report.md', '/acme/docs/archive/report.md')
```

Returns: `Promise<void>`

#### `moveFile(src, dest, options?)`

Moves or renames a file.

```typescript
await filesystem.moveFile('/acme/docs/draft.md', '/acme/docs/final.md')
```

Returns: `Promise<void>`

### Directory operations

#### `mkdir(path, options?)`

Creates a directory.

```typescript
await filesystem.mkdir('/acme/docs/reports', { recursive: true })
```

Returns: `Promise<void>`

#### `rmdir(path, options?)`

Removes a directory.

```typescript
await filesystem.rmdir('/acme/docs/reports', { recursive: true })
```

Returns: `Promise<void>`

#### `readdir(path, options?)`

Lists directory entries.

```typescript
const entries = await filesystem.readdir('/acme/docs', {
  recursive: true,
  extension: '.md',
})
```

Returns: `Promise<FileEntry[]>`

### Path operations

#### `exists(path)`

Checks whether a path exists.

```typescript
const exists = await filesystem.exists('/acme/docs/README.md')
```

Returns: `Promise<boolean>`

#### `stat(path)`

Returns file or directory metadata.

```typescript
const stat = await filesystem.stat('/acme/docs/README.md')
```

Returns: `Promise<FileStat>`

#### `realpath(path)`

Returns the canonical path from Mesa.

```typescript
const realPath = await filesystem.realpath('/acme/docs/README.md')
```

Returns: `Promise<string>`

### Mesa operations

#### `bash(options?)`

Creates a Mesa-backed Bash runtime for this filesystem.

```typescript
const bash = await filesystem.bash({
  cwd: '/acme/docs',
})
```

Returns: `Promise<Bash>`

## Path semantics

Methods expect absolute paths. For `MesaFilesystem`, paths are rooted at the Mesa mount and must include the org slug and repo name:

```typescript
await filesystem.readFile('/acme/docs/README.md')
```

Don't omit the leading slash:

```typescript
await filesystem.readFile('acme/docs/README.md') // Incorrect
await filesystem.readFile('/acme/docs/README.md') // Correct
```

The org comes from `org` in the constructor, or from the Mesa SDK's default org inference when `org` is omitted. It remains the first path segment.

When you mount multiple repos, each repo is available under the org segment:

```typescript
const filesystem = new MesaFilesystem({
  org: 'acme',
  repos: [
    { name: 'docs', bookmark: 'main' },
    { name: 'website', bookmark: 'main' },
  ],
})

await filesystem.readFile('/acme/docs/README.md')
await filesystem.readFile('/acme/website/package.json')
```

## Mesa versioning APIs

Access the underlying Mesa filesystem for Mesa-specific change and bookmark operations:

```typescript
await filesystem.writeFile('/acme/docs/draft.md', 'Draft')

const current = await filesystem.change.current({
  repo: 'docs',
})

await filesystem.bookmark.move({
  repo: 'docs',
  name: 'main',
  changeId: current.changeId,
})
```

More details on versioning semantics can be found in [Mesa's docs](https://docs.mesa.dev/content/concepts/versioning).

## Read-only mode

Set `readOnly: true` to block write operations through Mastra:

```typescript
const filesystem = new MesaFilesystem({
  repos: [{ name: 'docs', bookmark: 'main' }],
  readOnly: true,
})
```

Read operations still work. Write operations throw `WorkspaceReadOnlyError`.

## Concurrency

`overwrite: false` and `expectedMtime` use preflight checks before writing. These checks aren't atomic unless Mesa adds native conditional writes for app mounts.

## Related

- [WorkspaceFilesystem interface](https://mastra.ai/reference/workspace/filesystem)
- [Filesystem docs](https://mastra.ai/docs/workspace/filesystem)
- [Workspace overview](https://mastra.ai/docs/workspace/overview)
- [Mesa documentation](https://docs.mesa.dev/content/getting-started/introduction)