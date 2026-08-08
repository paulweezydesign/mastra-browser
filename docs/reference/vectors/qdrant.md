> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Qdrant vector store

The QdrantVector class provides vector search using [Qdrant](https://qdrant.tech/), a vector similarity search engine. It provides a production-ready service with a convenient API to store, search, and manage vectors with additional payload and extended filtering support.

## Constructor options

**url** (`string`): REST URL of the Qdrant instance. Eg. https\://xyz-example.eu-central.aws.cloud.qdrant.io:6333

**apiKey** (`string`): Optional Qdrant API key

**https** (`boolean`): Whether to use TLS when setting up the connection. Recommended.

## Methods

### `createIndex()`

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model). Required for single-vector collections.

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (Default: `cosine`)

**namedVectors** (`Record<string, { size: number; distance: 'cosine' | 'euclidean' | 'dotproduct' }>`): Configuration for named vector spaces. When provided, creates a collection with multiple named vector fields.

#### Creating a Named Vectors Collection

```typescript
// Create a collection with multiple named vector spaces
await store.createIndex({
  indexName: 'multi_modal',
  dimension: 768, // fallback
  namedVectors: {
    text: { size: 768, distance: 'cosine' },
    image: { size: 512, distance: 'euclidean' },
  },
})
```

### `upsert()`

**indexName** (`string`): Name of the index to upsert into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

**vectorName** (`string`): Name of the vector space to upsert into when using named vectors.

#### Upserting into Named Vector Spaces

```typescript
// Upsert into the "text" vector space
await store.upsert({
  indexName: 'multi_modal',
  vectors: textEmbeddings,
  metadata: textMetadata,
  vectorName: 'text',
})

// Upsert into the "image" vector space
await store.upsert({
  indexName: 'multi_modal',
  vectors: imageEmbeddings,
  metadata: imageMetadata,
  vectorName: 'image',
})
```

### `query()`

**indexName** (`string`): Name of the index to query

**queryVector** (`number[]`): Query vector to find similar vectors

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters for the query

**includeVector** (`boolean`): Whether to include vectors in the results (Default: `false`)

**using** (`string`): Name of the vector field to query when using named vectors. Use this when your collection has multiple named vector fields.

#### Named Vectors

Qdrant supports [multiple vectors per collection](https://qdrant.tech/documentation/concepts/vectors/#named-vectors), with a name assigned to each vector field. Use the `using` parameter to select the vector field to query:

```typescript
const results = await store.query({
  indexName: 'my_index',
  queryVector: embedding,
  topK: 10,
  using: 'title_embedding', // Query against a specific named vector
})
```

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

**indexName** (`string`): Name of the index to update

**id** (`string`): ID of the vector to update (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vector(s) to update (mutually exclusive with id)

**update** (`{ vector?: number[]; metadata?: Record<string, any>; }`): Object containing the vector and/or metadata to update

Updates a vector and/or its metadata in the specified index. If both vector and metadata are provided, both will be updated. Providing either value updates that value alone.

### `deleteVector()`

**indexName** (`string`): Name of the index from which to delete the vector

**id** (`string`): ID of the vector to delete

Deletes a vector from the specified index by its ID.

### `deleteVectors()`

Delete multiple vectors by IDs or by metadata filter. Either `ids` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vectors to delete

**ids** (`string[]`): Array of vector IDs to delete (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vectors to delete (mutually exclusive with ids)

### `createPayloadIndex()`

Creates a payload (metadata) index on a collection field to enable efficient filtering. This is **required** for Qdrant Cloud and any Qdrant instance with `strict_mode_config = true`.

**indexName** (`string`): Name of the collection to create the payload index on

**fieldName** (`string`): Name of the payload field to index

**fieldSchema** (`'keyword' | 'integer' | 'float' | 'geo' | 'text' | 'bool' | 'datetime' | 'uuid'`): The schema type for the payload field

**wait** (`boolean`): Whether to wait for the operation to complete (Default: `true`)

```typescript
// Create a keyword index for filtering by source
await store.createPayloadIndex({
  indexName: 'my_index',
  fieldName: 'source',
  fieldSchema: 'keyword',
})

const results = await store.query({
  indexName: 'my_index',
  queryVector: queryVector,
  filter: { source: 'document-a' },
})
```

### `deletePayloadIndex()`

Removes a payload index from a collection field.

**indexName** (`string`): Name of the collection to delete the payload index from

**fieldName** (`string`): Name of the payload field index to delete

**wait** (`boolean`): Whether to wait for the operation to complete (Default: `true`)

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

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)