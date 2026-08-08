> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Couchbase vector store

The `CouchbaseVector` class provides vector search using [Couchbase Vector Search](https://docs.couchbase.com/server/current/vector-search/vector-search.html). It enables efficient similarity search and metadata filtering within your Couchbase collections.

## Requirements

- **Couchbase Server 7.6.4+** or a compatible Capella cluster
- **Search Service enabled** on your Couchbase deployment

## Installation

**npm**:

```bash
npm install @mastra/couchbase@latest
```

**pnpm**:

```bash
pnpm add @mastra/couchbase@latest
```

**Yarn**:

```bash
yarn add @mastra/couchbase@latest
```

**Bun**:

```bash
bun add @mastra/couchbase@latest
```

## Usage example

```typescript
import { CouchbaseVector } from '@mastra/couchbase'

const store = new CouchbaseVector({
  id: 'couchbase-vector',
  connectionString: process.env.COUCHBASE_CONNECTION_STRING,
  username: process.env.COUCHBASE_USERNAME,
  password: process.env.COUCHBASE_PASSWORD,
  bucketName: process.env.COUCHBASE_BUCKET,
  scopeName: process.env.COUCHBASE_SCOPE,
  collectionName: process.env.COUCHBASE_COLLECTION,
})
```

## Constructor options

**id** (`string`): Unique identifier for this vector store instance

**connectionString** (`string`): Couchbase connection string

**username** (`string`): Couchbase username

**password** (`string`): Couchbase password

**bucketName** (`string`): Name of the Couchbase bucket to use

**scopeName** (`string`): Name of the Couchbase scope to use

**collectionName** (`string`): Name of the Couchbase collection to use

**options** (`CouchbaseClientOptions`): Optional Couchbase client options

## Methods

### `createIndex()`

Creates a new vector index in Couchbase.

> **Note:** Index creation is asynchronous. After calling `createIndex`, allow time (typically 1 to 5 seconds for small datasets, longer for large ones) before querying. For production, implement polling to check index status rather than using fixed delays.

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (Default: `cosine`)

### `upsert()`

Adds or updates vectors and their metadata in the collection.

> **Note:** You can upsert data before or after creating the index. The `upsert` method doesn't require the index to exist. Couchbase allows multiple Search indexes over the same collection.

**indexName** (`string`): Name of the index to insert into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

### `query()`

Searches for similar vectors.

> **Warning:** The `filter` and `includeVector` parameters aren't currently supported. Filtering must be performed client-side after retrieving results, or by using the Couchbase SDK's Search capabilities directly. To retrieve the vector embedding, fetch the full document by ID using the Couchbase SDK.

**indexName** (`string`): Name of the index to search in

**queryVector** (`number[]`): Query vector to find similar vectors for

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters

**includeVector** (`boolean`): Whether to include vector data in results (Default: `false`)

**minScore** (`number`): Minimum similarity score threshold (Default: `0`)

### `describeIndex()`

Returns information about the index.

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

Lists all vector indexes in the Couchbase bucket.

Returns: `Promise<string[]>`

### `updateVector()`

Updates a specific vector entry by its ID with new vector data and/or metadata. Filter-based updates aren't yet implemented for Couchbase.

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector entry to update

**update** (`{ vector?: number[]; metadata?: Record<string, any>; }`): Object containing the vector and/or metadata to update

### `deleteVector()`

Deletes a single vector by its ID from the index.

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to delete

### `deleteVectors()`

Deletes multiple vectors by their IDs. Filter-based deletion isn't yet implemented for Couchbase.

**indexName** (`string`): Name of the index containing the vectors to delete

**ids** (`string[]`): Array of vector IDs to delete

### `disconnect()`

Closes the Couchbase client connection. Should be called when done using the store.

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

## Error handling

The store throws typed errors that can be caught:

```typescript
try {
  await store.query({
    indexName: 'my_index',
    queryVector: queryVector,
  })
} catch (error) {
  // Handle specific error cases
  if (error.message.includes('Invalid index name')) {
    console.error(
      'Index name must start with a letter or underscore and contain only valid characters.',
    )
  } else if (error.message.includes('Index not found')) {
    console.error('The specified index does not exist')
  } else {
    console.error('Vector store error:', error.message)
  }
}
```

## Notes

- **Index Deletion Caveat:** Deleting a Search index doesn't delete the vectors/documents in the associated Couchbase collection. Data remains unless explicitly removed.
- **Required Permissions:** The Couchbase user must have permissions to connect, read/write documents in the target collection (`kv` role), and manage Search Indexes (`search_admin` role on the relevant bucket/scope).
- **Index Definition Details & Document Structure:** The `createIndex` method constructs a Search Index definition that indexes the `embedding` field (as type `vector`) and the `content` field (as type `text`), targeting documents within the specified `scopeName.collectionName`. Each document stores the vector in the `embedding` field and metadata in the `metadata` field. If `metadata` contains a `text` property, its value is also copied to a top-level `content` field, which is indexed for text search.
- **Replication & Durability:** Consider using Couchbase's built-in replication and persistence features for data durability. Monitor index statistics regularly to ensure efficient search.

## Limitations

- Index creation delays may impact immediate querying after creation.
- No hard enforcement of vector dimension at ingest time (dimension mismatches will error at query time).
- Vector insertion and index updates are eventually consistent. Strong consistency isn't guaranteed immediately after writes.

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)