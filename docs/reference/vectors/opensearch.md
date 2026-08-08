> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# OpenSearch vector store

The OpenSearchVector class provides vector search using [OpenSearch](https://opensearch.org/), an open-source search and analytics engine. It uses OpenSearch's k-NN capabilities to perform vector similarity search.

## Constructor options

The constructor accepts all [OpenSearch ClientOptions](https://opensearch.org/docs/latest/clients/javascript/index/) plus a required `id` field.

**id** (`string`): Unique identifier for this vector store instance

**node** (`string | string[] | NodeOptions | NodeOptions[]`): OpenSearch node URL(s) (e.g., 'http\://localhost:9200')

**auth** (`BasicAuth | BearerAuth | AwsSigv4Auth`): Authentication configuration

**ssl** (`ConnectionOptions`): SSL/TLS configuration

**compression** (`'gzip'`): Enable gzip compression

## Methods

### `createIndex()`

Creates a new index with the specified configuration.

**indexName** (`string`): The name of the index to create

**dimension** (`number`): The dimension of the vectors to be stored in the index

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): The distance metric to use for vector similarity (Default: `'cosine'`)

### `listIndexes()`

Lists all indexes in the OpenSearch instance.

Returns: `Promise<string[]>`

### `describeIndex()`

Gets information about an index.

**indexName** (`string`): The name of the index to describe

### `deleteIndex()`

**indexName** (`string`): The name of the index to delete

### `upsert()`

**indexName** (`string`): The name of the index to upsert vectors into

**vectors** (`number[][]`): Array of vector embeddings to insert

**metadata** (`Record<string, any>[]`): Array of metadata objects corresponding to each vector

**ids** (`string[]`): Optional array of IDs for the vectors. If not provided, random IDs will be generated

### `query()`

**indexName** (`string`): The name of the index to query

**queryVector** (`number[]`): The query vector to find similar vectors for

**topK** (`number`): The number of results to return (Default: `10`)

**filter** (`VectorFilter`): Optional filter to apply to the query (MongoDB-style query syntax)

### `updateVector()`

Update a single vector by ID or by metadata filter. Either `id` or `filter` must be provided, but not both.

**indexName** (`string`): The name of the index to update vectors in

**id** (`string`): The ID of the vector to update (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vector(s) to update (mutually exclusive with id)

**update** (`{ vector?: number[]; metadata?: Record<string, any>; }`): Object containing the vector and/or metadata to update

### `deleteVector()`

Deletes a single vector by its ID from the index.

**indexName** (`string`): The name of the index to delete the vector from

**id** (`string`): The ID of the vector to delete

### `deleteVectors()`

Delete multiple vectors by IDs or by metadata filter. Either `ids` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vectors to delete

**ids** (`string[]`): Array of vector IDs to delete (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vectors to delete (mutually exclusive with ids)

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)