> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Cloudflare storage

Mastra provides two Cloudflare storage implementations:

- **Cloudflare KV** (`CloudflareKVStorage`): A globally distributed, eventually consistent key-value store
- **Cloudflare Durable Objects** (`CloudflareDOStorage`): A strongly consistent, SQLite-based storage using Durable Objects

> **Observability Not Supported:** Cloudflare storage **doesn't support the observability domain**. Traces from the `MastraStorageExporter` can't be persisted, and [Studio's](https://mastra.ai/docs/studio/overview) observability features won't work with Cloudflare as your only storage provider. To enable observability, use [composite storage](https://mastra.ai/reference/storage/composite) to route observability data to a supported provider like ClickHouse.

## Installation

**npm**:

```bash
npm install @mastra/cloudflare@latest
```

**pnpm**:

```bash
pnpm add @mastra/cloudflare@latest
```

**Yarn**:

```bash
yarn add @mastra/cloudflare@latest
```

**Bun**:

```bash
bun add @mastra/cloudflare@latest
```

## Cloudflare KV Storage

The KV storage implementation provides a globally distributed, serverless key-value store solution using Cloudflare Workers KV.

### Usage

```typescript
import { CloudflareKVStorage } from '@mastra/cloudflare/kv'

// --- Example 1: Using Workers Binding ---
const storageWorkers = new CloudflareKVStorage({
  id: 'cloudflare-workers-storage',
  bindings: {
    threads: THREADS_KV, // KVNamespace binding for threads table
    messages: MESSAGES_KV, // KVNamespace binding for messages table
    // Add other tables as needed
  },
  keyPrefix: 'dev_', // Optional: isolate keys per environment
})

// --- Example 2: Using REST API ---
const storageRest = new CloudflareKVStorage({
  id: 'cloudflare-rest-storage',
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!, // Cloudflare Account ID
  apiToken: process.env.CLOUDFLARE_API_TOKEN!, // Cloudflare API Token
  namespacePrefix: 'dev_', // Optional: isolate namespaces per environment
})
```

### Parameters

**id** (`string`): Unique identifier for this storage instance.

**bindings** (`Record<string, KVNamespace>`): Cloudflare Workers KV bindings (for Workers runtime)

**accountId** (`string`): Cloudflare Account ID (for REST API)

**apiToken** (`string`): Cloudflare API Token (for REST API)

**namespacePrefix** (`string`): Optional prefix for all namespace names (useful for environment isolation)

**keyPrefix** (`string`): Optional prefix for all keys (useful for environment isolation)

### Additional notes

### Schema Management

The storage implementation handles schema creation and updates automatically. It creates the following tables:

- `threads`: Stores conversation threads
- `messages`: Stores individual messages
- `metadata`: Stores additional metadata for threads and messages

### Consistency & Propagation

Cloudflare KV is an eventually consistent store, meaning that data may not be immediately available across all regions after a write.

### Key Structure & Namespacing

Keys in Cloudflare KV are structured as a combination of a configurable prefix and a table-specific format (e.g., `threads:threadId`). For Workers deployments, `keyPrefix` is used to isolate data within a namespace; for REST API deployments, `namespacePrefix` is used to isolate entire namespaces between environments or applications.

## Cloudflare Durable Objects Storage

The Durable Objects storage implementation provides strongly consistent, SQLite-based storage using Cloudflare Durable Objects. This is ideal for applications that require transactional consistency and SQL query capabilities.

### Usage

```typescript
import { DurableObject } from 'cloudflare:workers'
import { CloudflareDOStorage } from '@mastra/cloudflare/do'

class AgentDurableObject extends DurableObject<Env> {
  private storage: CloudflareDOStorage

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.storage = new CloudflareDOStorage({
      sql: ctx.storage.sql,
      tablePrefix: 'mastra_', // Optional: prefix for table names
    })
  }

  async run() {
    const memory = await this.storage.getStore('memory')
    await memory?.saveThread({
      thread: { id: 'thread-1', resourceId: 'user-1', title: 'Chat', metadata: {} },
    })
  }
}
```

### Parameters

**sql** (`SqlStorage`): SqlStorage instance from Durable Objects ctx.storage.sql

**tablePrefix** (`string`): Optional prefix for table names (only letters, numbers, and underscores allowed)

**disableInit** (`boolean`): When true, automatic table creation/migrations are disabled. Useful for CI/CD pipelines where migrations run separately.

### Strong Consistency

Unlike KV, Durable Objects provide strong consistency guarantees. All reads and writes within a Durable Object are serialized, making it very suitable for fast, long-running agents.

### SQL Capabilities

Durable Objects storage uses SQLite under the hood, enabling efficient queries, filtering, and pagination that aren't possible with key-value storage.

## Schema Management

Both storage implementations handle schema creation and updates automatically. They create the following tables:

- `threads`: Stores conversation threads
- `messages`: Stores individual messages
- `workflow_snapshot`: Stores workflow run state

## Deprecated Aliases

For backwards compatibility, the following aliases are available:

```typescript
// These are deprecated - use CloudflareKVStorage and CloudflareDOStorage instead
import { CloudflareStore } from '@mastra/cloudflare/kv' // alias for CloudflareKVStorage
import { DOStore } from '@mastra/cloudflare/do' // alias for CloudflareDOStorage
```