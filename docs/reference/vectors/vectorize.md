> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Cloudflare vector store

The CloudflareVector class provides vector search using [Cloudflare Vectorize](https://developers.cloudflare.com/vectorize/), a vector database service integrated with Cloudflare's edge network.

## Constructor options

**accountId** (`string`): Cloudflare account ID

**apiToken** (`string`): Cloudflare API token with Vectorize permissions

## Methods

### `createIndex()`

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (dotproduct maps to dot-product) (Default: `cosine`)

### `upsert()`

**indexName** (`string`): Name of the index to upsert into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

### `query()`

**indexName** (`string`): Name of the index to query

**queryVector** (`number[]`): Query vector to find similar vectors

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters for the query

**includeVector** (`boolean`): Whether to include vectors in the results (Default: `false`)

### `listIndexes()`

Returns an array of index names as strings.

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

### `createMetadataIndex()`

Creates an index on a metadata field to enable filtering.

**indexName** (`string`): Name of the index containing the metadata field

**propertyName** (`string`): Name of the metadata field to index

**indexType** (`'string' | 'number' | 'boolean'`): Type of the metadata field

### `deleteMetadataIndex()`

Removes an index from a metadata field.

**indexName** (`string`): Name of the index containing the metadata field

**propertyName** (`string`): Name of the metadata field to remove indexing from

### `listMetadataIndexes()`

Lists all metadata field indexes for an index.

**indexName** (`string`): Name of the index to list metadata indexes for

### `updateVector()`

Updates a vector or metadata for a specific ID within an index.

**indexName** (`string`): Name of the index containing the ID to update

**id** (`string`): Unique identifier of the vector or metadata to update

**update** (`{ vector?: number[]; metadata?: Record<string, any>; }`): Object containing the vector and/or metadata to update

### `deleteVector()`

Deletes a vector and its associated metadata for a specific ID within an index.

**indexName** (`string`): Name of the index containing the ID to delete

**id** (`string`): Unique identifier of the vector and metadata to delete

## Response types

Query results are returned in this format:

```typescript
interface QueryResult {
  id: string
  score: number
  metadata: Record<string, any>
  vector?: number[]
}
```

## Error handling

The store throws typed errors that can be caught:

```typescript
try {
  await store.query({
    indexName: 'index_name',
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

Required environment variables:

- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Vectorize permissions

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)