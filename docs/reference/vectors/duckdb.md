> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# DuckDB vector store

The DuckDB storage implementation provides an embedded high-performance vector search solution using [DuckDB](https://duckdb.org/), an in-process analytical database. It uses the VSS extension for vector similarity search with HNSW indexing, offering a lightweight and efficient vector database that requires no external server.

It's part of the `@mastra/duckdb` package and offers efficient vector similarity search with metadata filtering.

## Installation

**npm**:

```bash
npm install @mastra/duckdb@latest
```

**pnpm**:

```bash
pnpm add @mastra/duckdb@latest
```

**Yarn**:

```bash
yarn add @mastra/duckdb@latest
```

**Bun**:

```bash
bun add @mastra/duckdb@latest
```

## Usage

```typescript
import { DuckDBVector } from "@mastra/duckdb";

// Create a new vector store instance
const store = new DuckDBVector({
  id: "duckdb-vector",
  path: ":memory:", // or './vectors.duckdb' for file persistence
});

// Create an index
await store.createIndex({
  indexName: "myCollection",
  dimension: 1536,
  metric: "cosine",
});

// Add vectors with metadata
const vectors = [[0.1, 0.2, ...], [0.3, 0.4, ...]];
const metadata = [
  { text: "first document", category: "A" },
  { text: "second document", category: "B" },
];
await store.upsert({
  indexName: "myCollection",
  vectors,
  metadata,
});

// Query similar vectors
const queryVector = [0.1, 0.2, ...];
const results = await store.query({
  indexName: "myCollection",
  queryVector,
  topK: 10,
  filter: { category: "A" },
});

// Clean up
await store.close();
```

## Constructor options

**id** (`string`): Unique identifier for the vector store instance

**path** (`string`): Database file path. Use ':memory:' for in-memory database, or a file path like './vectors.duckdb' for persistence. (Default: `':memory:'`)

**dimensions** (`number`): Default dimension for vector embeddings (Default: `1536`)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Default distance metric for similarity search (Default: `cosine`)

## Methods

### `createIndex()`

Creates a new vector collection with optional HNSW index for fast approximate nearest neighbor search.

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension size (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (Default: `cosine`)

### `upsert()`

Adds or updates vectors and their metadata in the index.

**indexName** (`string`): Name of the index to insert into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated UUIDs if not provided)

### `query()`

Searches for similar vectors with optional metadata filtering.

**indexName** (`string`): Name of the index to search in

**queryVector** (`number[]`): Query vector to find similar vectors for

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Filter`): Metadata filters using MongoDB-like query syntax

**includeVector** (`boolean`): Whether to include vector data in results (Default: `false`)

### `describeIndex()`

Gets information about an index.

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

Deletes an index and all its data.

**indexName** (`string`): Name of the index to delete

### `listIndexes()`

Lists all vector indexes in the database.

Returns: `Promise<string[]>`

### `updateVector()`

Update a single vector by ID or by metadata filter. Either `id` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector entry to update (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vector(s) to update (mutually exclusive with id)

**update** (`object`): Update data containing vector and/or metadata

**update.vector** (`number[]`): New vector data to update

**update.metadata** (`Record<string, any>`): New metadata to update

### `deleteVector()`

Deletes a specific vector entry from an index by its ID.

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector entry to delete

### `deleteVectors()`

Delete multiple vectors by IDs or by metadata filter. Either `ids` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vectors to delete

**ids** (`string[]`): Array of vector IDs to delete (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vectors to delete (mutually exclusive with ids)

### `close()`

Closes the database connection and releases resources.

```typescript
await store.close()
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

## Filter operators

DuckDB vector store supports MongoDB-like filter operators:

| Category   | Operators                                  |
| ---------- | ------------------------------------------ |
| Comparison | `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte` |
| Logical    | `$and`, `$or`, `$not`, `$nor`              |
| Array      | `$in`, `$nin`                              |
| Element    | `$exists`                                  |
| Text       | `$contains`                                |

### Filter Examples

```typescript
// Allegato operators
const results = await store.query({
  indexName: "docs",
  queryVector: [...],
  filter: {
    $and: [
      { category: "electronics" },
      { price: { $gte: 100, $lte: 500 } },
    ],
  },
});

// Nested field access
const results = await store.query({
  indexName: "docs",
  queryVector: [...],
  filter: { "user.profile.tier": "premium" },
});
```

## Distance metrics

| Metric       | Description       | Score Interpretation   | Best For                            |
| ------------ | ----------------- | ---------------------- | ----------------------------------- |
| `cosine`     | Cosine similarity | 0-1 (1 = most similar) | Text embeddings, normalized vectors |
| `euclidean`  | L2 distance       | 0-∞ (0 = most similar) | Image embeddings, spatial data      |
| `dotproduct` | Inner product     | Higher = more similar  | When vector magnitude matters       |

## Error handling

The store throws specific errors for different failure cases:

```typescript
try {
  await store.query({
    indexName: 'my-collection',
    queryVector: queryVector,
  })
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('The specified index does not exist')
  } else if (error.message.includes('Invalid identifier')) {
    console.error('Index name contains invalid characters')
  } else {
    console.error('Vector store error:', error.message)
  }
}
```

Common error cases include:

- Invalid index name format
- Index/table not found
- Dimension mismatch between query vector and index
- Empty filter or ids array in delete/update operations
- Mutual exclusivity violations (providing both `id` and `filter`)

## Use cases

### Embedded Semantic Search

Build offline-capable AI applications with semantic search that runs entirely in-process:

```typescript
const store = new DuckDBVector({
  id: 'offline-search',
  path: './search.duckdb',
})
```

### Local RAG Pipelines

Process sensitive documents locally without sending data to cloud vector databases:

```typescript
const store = new DuckDBVector({
  id: 'private-rag',
  path: './confidential.duckdb',
  dimensions: 1536,
})
```

### Development and Testing

Rapidly prototype vector search features with zero infrastructure:

```typescript
const store = new DuckDBVector({
  id: 'dev-store',
  path: ':memory:', // Fast in-memory for tests
})
```

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)
- [DuckDB Documentation](https://duckdb.org/docs/)