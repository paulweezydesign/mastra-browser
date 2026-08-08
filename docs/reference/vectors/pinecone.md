> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Pinecone vector store

The PineconeVector class provides an interface to [Pinecone](https://www.pinecone.io/)'s vector database. It provides real-time vector search, with features like hybrid search, metadata filtering, and namespace management.

## Constructor options

The constructor accepts all [Pinecone configuration options](https://docs.pinecone.io/reference/typescript-sdk) plus Mastra-specific fields.

**id** (`string`): Unique identifier for this vector store instance

**apiKey** (`string`): Pinecone API key

**controllerHostUrl** (`string`): Custom Pinecone controller host URL

**additionalHeaders** (`Record<string, string>`): Additional HTTP headers to include in requests

**sourceTag** (`string`): Source tag for request tracking

**cloud** (`'aws' | 'gcp' | 'azure'`): Cloud provider for new index creation (Default: `aws`)

**region** (`string`): Region for new index creation (Default: `us-east-1`)

## Methods

### `createIndex()`

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search. Use 'dotproduct' if you plan to use hybrid search. (Default: `cosine`)

### `upsert()`

**indexName** (`string`): Name of your Pinecone index

**vectors** (`number[][]`): Array of dense embedding vectors

**sparseVectors** (`{ indices: number[], values: number[] }[]`): Array of sparse vectors for hybrid search. Each vector must have matching indices and values arrays.

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

**namespace** (`string`): Optional namespace to store vectors in. Vectors in different namespaces are isolated from each other.

### `query()`

**indexName** (`string`): Name of the index to query

**queryVector** (`number[]`): Dense query vector to find similar vectors

**sparseVector** (`{ indices: number[], values: number[] }`): Optional sparse vector for hybrid search. Must have matching indices and values arrays.

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters for the query

**includeVector** (`boolean`): Whether to include the vector in the result (Default: `false`)

**namespace** (`string`): Optional namespace to query vectors from. Only returns results from the specified namespace.

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

Update a single vector by ID or by metadata filter. Either `id` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to update (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vector(s) to update (mutually exclusive with id)

**namespace** (`string`): Optional namespace for the update operation

**update** (`object`): Update parameters

**update.vector** (`number[]`): New vector values to update

**update.metadata** (`Record<string, any>`): New metadata to update

### `deleteVector()`

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to delete

### `deleteVectors()`

Delete multiple vectors by IDs or by metadata filter. Either `ids` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vectors to delete

**ids** (`string[]`): Array of vector IDs to delete (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vectors to delete (mutually exclusive with ids)

**namespace** (`string`): Optional namespace for the deletion operation

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

### Environment variables

Required environment variables:

- `PINECONE_API_KEY`: Your Pinecone API key

## Hybrid search

Pinecone supports hybrid search by combining dense and sparse vectors. To use hybrid search:

1. Create an index with `metric: 'dotproduct'`
2. During upsert, provide sparse vectors using the `sparseVectors` parameter
3. During query, provide a sparse vector using the `sparseVector` parameter

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)