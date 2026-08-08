> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Lance vector store

The LanceVectorStore class provides vector search using [LanceDB](https://lancedb.github.io/lancedb/), an embedded vector database built on the Lance columnar format. It offers efficient storage and fast similarity search for both local development and production deployments.

## Factory method

The LanceVectorStore uses a factory pattern for creation. You should use the static `create()` method rather than the constructor directly.

**uri** (`string`): Path to LanceDB database or URI for cloud deployments

**options** (`ConnectionOptions`): Additional connection options for LanceDB

## Constructor examples

You can create a `LanceVectorStore` instance using the static create method:

```ts
import { LanceVectorStore } from '@mastra/lance'

// Connect to a local database
const vectorStore = await LanceVectorStore.create('/path/to/db')

// Connect to a LanceDB cloud database
const cloudStore = await LanceVectorStore.create('db://host:port')

// Connect to a cloud database with options
const s3Store = await LanceVectorStore.create('s3://bucket/db', {
  storageOptions: { timeout: '60s' },
})
```

## Methods

### `createIndex()`

**tableName** (`string`): Name of the table to create index in

**indexName** (`string`): Name of the index (column name) to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (Default: `cosine`)

**indexConfig** (`LanceIndexConfig`): Index configuration (Default: `{ type: 'hnsw' }`)

#### `LanceIndexConfig`

**type** (`'ivfflat' | 'hnsw'`): Index type (Default: `hnsw`)

**type.ivfflat** (`ivfflat`): Clusters vectors into lists for approximate search.

**type.hnsw** (`hnsw`): Graph-based index offering fast search times and high recall.

**numPartitions** (`number`): Number of partitions for IVF indexes (Default: `128`)

**numSubVectors** (`number`): Number of sub-vectors for product quantization (Default: `16`)

**hnsw** (`HNSWConfig`): HNSW configuration

**hnsw\.m** (`number`): Maximum number of connections per node (default: 16)

**hnsw\.efConstruction** (`number`): Build-time complexity (default: 100)

### `createTable()`

**tableName** (`string`): Name of the table to create

**data** (`Record<string, unknown>[] | TableLike`): Initial data for the table

**options** (`Partial<CreateTableOptions>`): Additional table creation options

### `upsert()`

**tableName** (`string`): Name of the table to upsert vectors into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

### `query()`

**tableName** (`string`): Name of the table to query

**queryVector** (`number[]`): Query vector

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters

**includeVector** (`boolean`): Whether to include the vector in the result (Default: `false`)

**columns** (`string[]`): Specific columns to include in the result (Default: `[]`)

**includeAllColumns** (`boolean`): Whether to include all columns in the result (Default: `false`)

### `listTables()`

Returns an array of table names as strings.

```typescript
const tables = await vectorStore.listTables()
// ['my_vectors', 'embeddings', 'documents']
```

### `getTableSchema()`

**tableName** (`string`): Name of the table to describe

Returns the schema of the specified table.

### `deleteTable()`

**tableName** (`string`): Name of the table to delete

### `deleteAllTables()`

Deletes all tables in the database.

### `listIndexes()`

Returns an array of index names as strings.

### `describeIndex()`

**indexName** (`string`): Name of the index to describe

Returns information about the index:

```typescript
interface IndexStats {
  dimension: number
  count: number
  metric: 'cosine' | 'euclidean' | 'dotproduct'
  type: 'ivfflat' | 'hnsw'
  config: {
    m?: number
    efConstruction?: number
    numPartitions?: number
    numSubVectors?: number
  }
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

### `close()`

Closes the database connection.

## Response types

Query results are returned in this format:

```typescript
interface QueryResult {
  id: string
  score: number
  metadata: Record<string, any>
  vector?: number[] // Only included if includeVector is true
  document?: string // Document text if available
}
```

## Error handling

The store throws typed errors that can be caught:

```typescript
try {
  await store.query({
    tableName: 'my_vectors',
    queryVector: queryVector,
  })
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message)
  }
}
```

## Best practices

- Use the appropriate index type for your use case:

  - HNSW for better recall and performance when memory isn't constrained
  - IVF for better memory efficiency with large datasets

- For optimal performance with large datasets, consider adjusting `numPartitions` and `numSubVectors` values

- Use `close()` method to properly close connections when done with the database

- Store metadata with a consistent schema to simplify filtering operations

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)