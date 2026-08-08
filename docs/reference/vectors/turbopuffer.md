> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Turbopuffer vector store

The TurbopufferVector class provides vector search using [Turbopuffer](https://turbopuffer.com/), a high-performance vector database optimized for RAG applications. Turbopuffer offers fast vector similarity search with advanced filtering capabilities and efficient storage management.

## Constructor options

**apiKey** (`string`): The API key to authenticate with Turbopuffer

**baseUrl** (`string`): The base URL for the Turbopuffer API (Default: `https://api.turbopuffer.com`)

**connectTimeout** (`number`): The timeout to establish a connection, in ms. Only applicable in Node and Deno. (Default: `10000`)

**connectionIdleTimeout** (`number`): The socket idle timeout, in ms. Only applicable in Node and Deno. (Default: `60000`)

**warmConnections** (`number`): The number of connections to open initially when creating a new client. (Default: `0`)

**compression** (`boolean`): Whether to compress requests and accept compressed responses. (Default: `true`)

**consistency** (`'strong' | 'eventual'`): The default consistency level for queries. Can be overridden per query. "strong" guarantees queries see all data written before the query started, at the cost of higher latency. "eventual" offers lower latency, but recently written data may not be visible yet. (Default: `strong`)

**schemaConfigForIndex** (`function`): A callback function that takes an index name and returns a config object for that index. You can define explicit schemas per index.

## Methods

### `createIndex()`

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (Default: `cosine`)

### `upsert()`

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

### `query()`

**indexName** (`string`): Name of the index to query

**queryVector** (`number[]`): Query vector to find similar vectors

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters for the query

**includeVector** (`boolean`): Whether to include vectors in the results (Default: `false`)

**consistency** (`'strong' | 'eventual'`): The consistency level for this query. Overrides the consistency level set in the constructor. Defaults to "strong".

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

**update** (`{ vector?: number[]; metadata?: Record<string, any>; }`): Object containing the vector and/or metadata to update

### `deleteVector()`

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to delete

### `deleteVectors()`

Delete multiple vectors by IDs or by metadata filter. Either `ids` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vectors to delete

**ids** (`string[]`): Array of vector IDs to delete (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vectors to delete (mutually exclusive with ids)

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

## Schema configuration

The `schemaConfigForIndex` option allows you to define explicit schemas for different indexes:

```typescript
schemaConfigForIndex: (indexName: string) => {
  // Mastra's default embedding model and index for memory messages:
  if (indexName === 'memory_messages_384') {
    return {
      dimensions: 384,
      schema: {
        thread_id: {
          type: 'string',
          filterable: true,
        },
      },
    }
  } else {
    throw new Error(`TODO: add schema for index: ${indexName}`)
  }
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

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)