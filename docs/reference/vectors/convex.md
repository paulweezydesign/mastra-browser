> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Convex vector store

The `ConvexVector` class provides vector storage and similarity search using [Convex](https://convex.dev). It stores embeddings inside Convex and performs cosine similarity search in the Mastra adapter.

> **Development-scale search:** `ConvexVector` reads matching vectors through the Mastra storage handler, filters in JavaScript, computes cosine similarity, sorts results, and returns the top matches. Use it for local development, tests, and small datasets.
>
> For production vector search on Convex, use `ConvexNativeVector`. It uses the Convex native `vectorSearch` API, which requires a deployed Convex vector index and a Convex action.

## Installation

**npm**:

```bash
npm install @mastra/convex@latest
```

**pnpm**:

```bash
pnpm add @mastra/convex@latest
```

**Yarn**:

```bash
yarn add @mastra/convex@latest
```

**Bun**:

```bash
bun add @mastra/convex@latest
```

## Convex setup

Before using `ConvexVector`, you need to set up the Convex schema and storage handler. See [Convex Storage Setup](https://mastra.ai/reference/storage/convex) for setup instructions.

## Constructor options

**deploymentUrl** (`string`): Convex deployment URL (e.g., https\://your-project.convex.cloud)

**adminAuthToken** (`string`): Convex admin authentication token

**storageFunction** (`string`): Path to the storage mutation function (Default: `mastra/storage:handle`)

## Constructor examples

### Basic configuration

```ts
import { ConvexVector } from '@mastra/convex'

const vectorStore = new ConvexVector({
  id: 'convex-vectors',
  deploymentUrl: 'https://your-project.convex.cloud',
  adminAuthToken: 'your-admin-token',
})
```

### Native Convex vector search

Use `ConvexNativeVector` for production vector workloads. It stores vectors in a dedicated Convex table and queries a schema-defined Convex vector index.

In `convex/schema.ts`, define a dedicated table for each Mastra vector index:

```typescript
import { defineSchema } from 'convex/server'
import { defineMastraNativeVectorTable } from '@mastra/convex/schema'

export default defineSchema({
  docs_vectors: defineMastraNativeVectorTable({
    dimensions: 1536,
  }),
})
```

In `convex/mastra/nativeVector.ts`, export the native vector handlers:

```typescript
import {
  mastraNativeVectorAction,
  mastraNativeVectorMutation,
  mastraNativeVectorQuery,
} from '@mastra/convex/server'

export const query = mastraNativeVectorAction
export const read = mastraNativeVectorQuery
export const write = mastraNativeVectorMutation
```

In your Mastra app, configure `ConvexNativeVector` with the deployed table and vector index:

```typescript
import { ConvexNativeVector } from '@mastra/convex'

const vectorStore = new ConvexNativeVector({
  id: 'convex-native-vectors',
  deploymentUrl: process.env.CONVEX_URL!,
  adminAuthToken: process.env.CONVEX_ADMIN_KEY!,
  indexes: {
    docs: {
      tableName: 'docs_vectors',
      vectorIndexName: 'by_embedding',
      dimension: 1536,
    },
  },
})

const results = await vectorStore.query({
  indexName: 'docs',
  queryVector: embedding,
  topK: 10,
})
```

For native filter support, declare filter fields in your Convex schema. The native vector handlers copy matching metadata fields to top-level document fields when vectors are written.

```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  docs_vectors: defineTable({
    id: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.optional(v.any()),
    tenantId: v.string(),
  })
    .index('by_record_id', ['id'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536,
      filterFields: ['tenantId'],
    }),
})
```

```typescript
const vectorStore = new ConvexNativeVector({
  id: 'convex-native-vectors',
  deploymentUrl: process.env.CONVEX_URL!,
  adminAuthToken: process.env.CONVEX_ADMIN_KEY!,
  indexes: {
    docs: {
      tableName: 'docs_vectors',
      dimension: 1536,
      filterFields: ['tenantId'],
    },
  },
})

await vectorStore.upsert({
  indexName: 'docs',
  ids: ['chunk-1'],
  vectors: [embedding],
  metadata: [{ tenantId: 'acme', text: 'Account setup guide' }],
})

const results = await vectorStore.query({
  indexName: 'docs',
  queryVector: embedding,
  filter: { tenantId: 'acme' },
})
```

`ConvexNativeVector` supports Convex native vector filter shapes: one equality field, or `$or` of equality fields. It doesn't support metadata-only queries, filter-based updates, or filter-based deletes. Use vector IDs for updates and deletes.

### Custom storage function

```ts
const vectorStore = new ConvexVector({
  id: 'convex-vectors',
  deploymentUrl: 'https://your-project.convex.cloud',
  adminAuthToken: 'your-admin-token',
  storageFunction: 'custom/path:handler',
})
```

## Methods

### `createIndex()`

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (only cosine is currently supported) (Default: `cosine`)

```typescript
await vectorStore.createIndex({
  indexName: 'my_vectors',
  dimension: 1536,
})
```

### `upsert()`

**indexName** (`string`): Name of the index to upsert vectors into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

```typescript
await vectorStore.upsert({
  indexName: "my_vectors",
  vectors: [[0.1, 0.2, 0.3, ...]],
  metadata: [{ label: "example" }],
  ids: ["vec-1"],
});
```

### `query()`

**indexName** (`string`): Name of the index to query

**queryVector** (`number[]`): Query vector

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters

**includeVector** (`boolean`): Whether to include the vector in the result (Default: `false`)

```typescript
const results = await vectorStore.query({
  indexName: "my_vectors",
  queryVector: [0.1, 0.2, 0.3, ...],
  topK: 5,
  filter: { category: "documents" },
});
```

### `listIndexes()`

Returns an array of index names as strings.

```typescript
const indexes = await vectorStore.listIndexes()
// ["my_vectors", "embeddings", ...]
```

### `describeIndex()`

**indexName** (`string`): Name of the index to describe

Returns:

```typescript
interface IndexStats {
  dimension: number
  count: number
  metric: 'cosine' | 'euclidean' | 'dotproduct'
}
```

### `deleteIndex()`

**indexName** (`string`): Name of the index to delete

Deletes the index and all its vectors.

```typescript
await vectorStore.deleteIndex({ indexName: 'my_vectors' })
```

### `updateVector()`

Update a single vector by ID or by metadata filter. Either `id` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to update (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vector(s) to update (mutually exclusive with id)

**update** (`{ vector?: number[]; metadata?: Record<string, any>; }`): Object containing the vector and/or metadata to update

```typescript
// Update by ID
await vectorStore.updateVector({
  indexName: 'my_vectors',
  id: 'vector123',
  update: {
    vector: [0.1, 0.2, 0.3],
    metadata: { label: 'updated' },
  },
})

// Update by filter
await vectorStore.updateVector({
  indexName: 'my_vectors',
  filter: { category: 'product' },
  update: {
    metadata: { status: 'reviewed' },
  },
})
```

### `deleteVector()`

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to delete

```typescript
await vectorStore.deleteVector({ indexName: 'my_vectors', id: 'vector123' })
```

### `deleteVectors()`

Delete multiple vectors by IDs or by metadata filter. Either `ids` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vectors to delete

**ids** (`string[]`): Array of vector IDs to delete (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vectors to delete (mutually exclusive with ids)

```typescript
// Delete by IDs
await vectorStore.deleteVectors({
  indexName: 'my_vectors',
  ids: ['vec1', 'vec2', 'vec3'],
})

// Delete by filter
await vectorStore.deleteVectors({
  indexName: 'my_vectors',
  filter: { status: 'archived' },
})
```

## Response types

Query results are returned in this format:

```typescript
interface QueryResult {
  id: string
  score: number
  metadata: Record<string, any>
  vector?: number[] // Only included if includeVector is true
}
```

## Metadata filtering

`ConvexVector` supports metadata filtering with operators. These filters are applied by the adapter after vectors are loaded from Convex.

```typescript
// Simple equality
const results = await vectorStore.query({
  indexName: 'my_vectors',
  queryVector: embedding,
  filter: { category: 'documents' },
})

// Comparison operators
const results = await vectorStore.query({
  indexName: 'my_vectors',
  queryVector: embedding,
  filter: {
    price: { $gt: 100 },
    status: { $in: ['active', 'pending'] },
  },
})

// Logical operators
const results = await vectorStore.query({
  indexName: 'my_vectors',
  queryVector: embedding,
  filter: {
    $and: [{ category: 'electronics' }, { price: { $lte: 500 } }],
  },
})
```

### Supported filter operators

| Operator | Description           |
| -------- | --------------------- |
| `$eq`    | Equal to              |
| `$ne`    | Not equal to          |
| `$gt`    | Greater than          |
| `$gte`   | Greater than or equal |
| `$lt`    | Less than             |
| `$lte`   | Less than or equal    |
| `$in`    | In array              |
| `$nin`   | Not in array          |
| `$and`   | Logical AND           |
| `$or`    | Logical OR            |

## Architecture

`ConvexVector` stores vectors in the `mastra_vectors` table with the following structure:

- `id`: Unique vector identifier
- `indexName`: Name of the index
- `embedding`: The vector data (array of floats)
- `metadata`: Optional JSON metadata

Vector similarity search is performed with cosine similarity in the Mastra adapter. This keeps setup flexible, but it's not designed for large production vector collections.

`ConvexNativeVector` stores each Mastra vector index in a dedicated Convex table. Its queries call a Convex action that uses `ctx.vectorSearch`, then load the matched documents through a Convex query. This follows the Convex native vector search model:

- Vector indexes are declared in `convex/schema.ts`.
- Vector search runs from a Convex action.
- `topK` must be between `1` and `256`.
- Filters must target fields listed in the Convex vector index `filterFields`.
- Use one dedicated table per Mastra vector index to avoid cross-index results.

Use an external vector database when you need runtime-defined index creation at runtime, metadata-only queries, complex filter operators, filter-based bulk updates or deletes, or result limits above Convex's native vector search cap.

## Related

- [Convex Storage](https://mastra.ai/reference/storage/convex)
- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)
- [Convex Documentation](https://docs.convex.dev/)