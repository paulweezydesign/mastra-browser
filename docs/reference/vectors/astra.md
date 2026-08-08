> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Astra vector store

The AstraVector class provides vector search using [DataStax Astra DB](https://www.datastax.com/products/datastax-astra), a cloud-native, serverless database built on Apache Cassandra. It provides vector search capabilities with enterprise-grade capacity and high availability.

## Constructor options

**token** (`string`): Astra DB API token

**endpoint** (`string`): Astra DB API endpoint

**keyspace** (`string`): Optional keyspace name

## Methods

### `createIndex()`

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (maps to dot\_product for dotproduct) (Default: `cosine`)

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

### `updateVector()`

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to update

**update** (`object`): Update object containing vector and/or metadata changes

### `deleteVector()`

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to delete

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

- `ASTRA_DB_TOKEN`: Your Astra DB API token
- `ASTRA_DB_ENDPOINT`: Your Astra DB API endpoint

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)