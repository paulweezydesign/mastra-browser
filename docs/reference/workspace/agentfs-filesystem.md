> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# AgentFSFilesystem

Stores files in a Turso/SQLite database via the [AgentFS](https://github.com/nichochar/agentfs) SDK. Files are persisted across sessions in a local SQLite database, giving agents durable storage without external cloud services. For interface details, see [WorkspaceFilesystem Interface](https://mastra.ai/reference/workspace/filesystem).

## Installation

**npm**:

```bash
npm install @mastra/agentfs
```

**pnpm**:

```bash
pnpm add @mastra/agentfs
```

**Yarn**:

```bash
yarn add @mastra/agentfs
```

**Bun**:

```bash
bun add @mastra/agentfs
```

## Usage

Add an `AgentFSFilesystem` to a workspace and assign it to an agent. You must provide at least one of `agentId`, `path`, or `agent` when instantiating the `AgentFSFilesystem` class.

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { AgentFSFilesystem } from '@mastra/agentfs'

const workspace = new Workspace({
  filesystem: new AgentFSFilesystem({
    agentId: 'my-agent',
  }),
})

const agent = new Agent({
  id: 'file-agent',
  name: 'file-agent',
  model: 'openai/gpt-5.6-sol',
  workspace,
})
```

### Using an explicit database path

By default, databases are stored inside the `.agentfs` directory with the `agentId` as filename. You can specify a custom database path:

```typescript
import { AgentFSFilesystem } from '@mastra/agentfs'

const filesystem = new AgentFSFilesystem({
  path: '/data/my-agent.db',
})
```

### Using a pre-opened AgentFS instance

If you need to manage the AgentFS lifecycle yourself:

```typescript
import { AgentFS } from 'agentfs-sdk'
import { AgentFSFilesystem } from '@mastra/agentfs'

const agent = await AgentFS.open({ id: 'my-agent' })

const filesystem = new AgentFSFilesystem({
  agent, // caller manages open/close
})
```

## Constructor parameters

You must provide at least one of `agentId`, `path`, or `agent`.

**agentId** (`string`): Agent ID — creates database at .agentfs/\<agentId>.db

**path** (`string`): Explicit database file path (alternative to agentId)

**agent** (`AgentFS`): Pre-opened AgentFS instance. When provided, the caller manages the lifecycle (open/close).

**id** (`string`): Unique identifier for this filesystem instance (Default: `Auto-generated`)

**displayName** (`string`): Human-friendly display name for the UI (Default: `'AgentFS'`)

**icon** (`FilesystemIcon`): Icon identifier for the UI (Default: `'database'`)

**description** (`string`): Short description of this filesystem for the UI

**readOnly** (`boolean`): When true, all write operations are blocked (Default: `false`)

## Properties

**id** (`string`): Filesystem instance identifier

**name** (`string`): Provider name ('AgentFSFilesystem')

**provider** (`string`): Provider identifier ('agentfs')

**readOnly** (`boolean | undefined`): Whether the filesystem is in read-only mode