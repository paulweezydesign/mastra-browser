> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Amazon S3 vectors store

The `S3Vectors` class provides vector search using [Amazon S3 Vectors (Preview)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors.html). It stores vectors in **vector buckets** and performs similarity search in **vector indexes**, with JSON-based metadata filters.

> **Warning:** Amazon S3 Vectors is a Preview service. Preview features may change or be removed without notice and aren't covered by AWS SLAs. Behavior, limits, and regional availability can change at any time. This library may introduce breaking changes to stay aligned with AWS.

## Installation

**npm**:

```bash
npm install @mastra/s3vectors@latest
```

**pnpm**:

```bash
pnpm add @mastra/s3vectors@latest
```

**Yarn**:

```bash
yarn add @mastra/s3vectors@latest
```

**Bun**:

```bash
bun add @mastra/s3vectors@latest
```

## Usage example

```typescript
import { S3Vectors } from '@mastra/s3vectors'

const store = new S3Vectors({
  vectorBucketName: process.env.S3_VECTORS_BUCKET_NAME!, // e.g. "my-vector-bucket"
  clientConfig: {
    region: process.env.AWS_REGION!, // credentials use the default AWS provider chain
  },
  // Optional: mark large/long-text fields as non-filterable at index creation time
  nonFilterableMetadataKeys: ['content'],
})

// Create an index (names are normalized: "_" → "-" and lowercased)
await store.createIndex({
  indexName: 'my_index',
  dimension: 1536,
  metric: 'cosine', // "euclidean" also supported; "dotproduct" is NOT supported
})

// Upsert vectors (ids auto-generated if omitted). Date values in metadata are serialized to epoch ms.
const ids = await store.upsert({
  indexName: 'my_index',
  vectors: [
    [0.1, 0.2 /* … */],
    [0.3, 0.4 /* … */],
  ],
  metadata: [
    {
      text: 'doc1',
      genre: 'documentary',
      year: 2023,
      createdAt: new Date('2024-01-01'),
    },
    { text: 'doc2', genre: 'comedy', year: 2021 },
  ],
})

// Query with metadata filters (implicit AND is canonicalized)
const results = await store.query({
  indexName: 'my-index',
  queryVector: [0.1, 0.2 /* … */],
  topK: 10, // Service-side limits may apply (commonly 30)
  filter: { genre: { $in: ['documentary', 'comedy'] }, year: { $gte: 2020 } },
  includeVector: false, // set true to include raw vectors (may trigger a secondary fetch)
})

// Clean up resources (closes the underlying HTTP handler)
await store.disconnect()
```

## Constructor options

**vectorBucketName** (`string`): Target S3 Vectors vector bucket name.

**clientConfig** (`S3VectorsClientConfig`): AWS SDK v3 client options (e.g., region, credentials).

**nonFilterableMetadataKeys** (`string[]`): Metadata keys that should NOT be filterable (applied to the index at creation time). Use this for large text fields like content.

## Methods

### `createIndex()`

Creates a new vector index in the configured vector bucket. If the index already exists, the call validates the schema and becomes a no-op (existing metric and dimension are preserved).

**indexName** (`string`): Logical index name. Normalized internally: underscores are replaced with hyphens and the name is lowercased.

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean'`): Distance metric for similarity search. dotproduct is not supported by S3 Vectors. (Default: `cosine`)

### `upsert()`

Adds or replaces vectors (full-record put). If `ids` aren't provided, UUIDs are generated.

**indexName** (`string`): Name of the index to upsert into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

### `query()`

Searches for nearest neighbors with optional metadata filtering.

**indexName** (`string`): Name of the index to query

**queryVector** (`number[]`): Query vector to find similar vectors

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`S3VectorsFilter`): JSON-based metadata filter supporting $and, $or, $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists.

**includeVector** (`boolean`): Whether to include vectors in the results (Default: `false`)

> **Note:** Results include `score = 1/(1 + distance)` so that higher is better while preserving the underlying distance ranking.

### `describeIndex()`

Returns information about the index.

**indexName** (`string`): Index name to describe.

Returns:

```typescript
interface IndexStats {
  dimension: number
  count: number // computed via ListVectors pagination (O(n))
  metric: 'cosine' | 'euclidean'
}
```

### `deleteIndex()`

Deletes an index and its data.

**indexName** (`string`): Index to delete.

### `listIndexes()`

Lists all indexes in the configured vector bucket.

Returns: `Promise<string[]>`

### `updateVector()`

Updates a vector or metadata for a specific ID within an index.

**indexName** (`string`): Index containing the vector.

**id** (`string`): ID to update.

**update** (`object`): Update data containing vector and/or metadata

**update.vector** (`number[]`): New vector data to update

**update.metadata** (`Record<string, any>`): New metadata to update

### `deleteVector()`

Deletes a specific vector by ID.

**indexName** (`string`): Index containing the vector.

**id** (`string`): ID to delete.

### `disconnect()`

Closes the underlying AWS SDK HTTP handler to free sockets.

## Response types

Query results are returned in this format:

```typescript
interface QueryResult {
  id: string
  score: number // 1/(1 + distance)
  metadata: Record<string, any>
  vector?: number[] // Only included if includeVector is true
}
```

## Filter syntax

S3 Vectors supports a strict subset of operators and value types. The Mastra filter translator:

- **Canonicalizes implicit AND**: `{a:1,b:2}` → `{ $and: [{a:1},{b:2}] }`.
- **Normalizes Date values** to epoch ms for numeric comparisons and array elements.
- **Disallows Date** in equality positions (`field: value` or `$eq/$ne`). Equality values must be **string | number | boolean**.
- **Rejects** null/undefined for equality. **array equality** isn't supported (use `$in`/`$nin`).
- Only **`$and` / `$or`** are allowed as top-level logical operators.
- Logical operators must contain **field conditions** (not direct operators).

**Supported operators:**

- **Logical:** `$and`, `$or` (non-empty arrays)
- **Basic:** `$eq`, `$ne` (string | number | boolean)
- **Numeric:** `$gt`, `$gte`, `$lt`, `$lte` (number or `Date` → epoch ms)
- **Array:** `$in`, `$nin` (non-empty arrays of string | number | boolean; `Date` → epoch ms)
- **Element:** `$exists` (boolean)

**Unsupported / disallowed (rejected):** `$not`, `$nor`, `$regex`, `$all`, `$elemMatch`, `$size`, `$text`, etc.

**Examples:**

```typescript
// Implicit AND
{ genre: { $in: ["documentary", "comedy"] }, year: { $gte: 2020 } }

// Explicit logicals and ranges
{
  $and: [
    { price: { $gte: 100, $lte: 1000 } },
    { $or: [{ stock: { $gt: 0 } }, { preorder: true }] }
  ]
}

// Dates in range (converted to epoch ms)
{ timestamp: { $gt: new Date("2024-01-01T00:00:00Z") } }
```

> **Note:** If you set `nonFilterableMetadataKeys` at index creation, those keys are stored but **can't** be used in filters.

## Error handling

The store throws typed errors that can be caught:

```typescript
try {
  await store.query({
    indexName: 'index-name',
    queryVector: queryVector,
  })
} catch (error) {
  if (error instanceof VectorStoreError) {
    console.log(error.code) // 'connection_failed' | 'invalid_dimension' | etc
    console.log(error.details) // Additional error context
  }
}
```

## Environment variables

Typical environment variables when wiring your app:

- `S3_VECTORS_BUCKET_NAME`: Your S3 **vector bucket** name (used to populate `vectorBucketName`).
- `AWS_REGION`: AWS region for the S3 Vectors bucket.
- **AWS credentials**: via the standard AWS SDK provider chain (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_PROFILE`, etc.).

## Best practices

- Choose the metric (`cosine` or `euclidean`) to match your embedding model. `dotproduct` isn't supported.
- Keep **filterable** metadata small and structured (string/number/boolean). Store large text (e.g., `content`) as **non-filterable**.
- Use **dotted paths** for nested metadata and explicit `$and`/`$or` for complex logic.
- Avoid calling `describeIndex()` on hot paths. `count` is computed with paginated `ListVectors` (**O(n)**).
- Use `includeVector: true` only when you need raw vectors.

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)