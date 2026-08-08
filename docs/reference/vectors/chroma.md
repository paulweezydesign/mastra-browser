> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Chroma vector store

The ChromaVector class provides vector search using [Chroma](https://docs.trychroma.com/docs/overview/getting-started), an open-source embedding database. It offers efficient vector search with metadata filtering and hybrid search capabilities.

> **Info:**
>
> **Chroma Cloud**
>
> Chroma Cloud powers serverless vector and full-text search. It's extremely fast, cost-effective, high-capacity, and painless. Create a DB and try it out in under 30 seconds with $5 of free credits.
>
> [Get started with Chroma Cloud](https://trychroma.com/signup)

## Constructor options

**host** (`string`): The host address of the Chroma server. Defaults to 'localhost'

**port** (`number`): The port number of the Chroma server. Defaults to 8000

**ssl** (`boolean`): Whether to use SSL/HTTPS for connections. Defaults to false

**apiKey** (`string`): A Chroma Cloud API key

**tenant** (`string`): The tenant name in the Chroma server to connect to. Defaults to 'default\_tenant' for single-node Chroma. Auto-resolved for Chroma Cloud users based on the provided API key

**database** (`string`): The database name to connect to. Defaults to 'default\_database' for single-node Chroma. Auto-resolved for Chroma Cloud users based on the provided API key

**headers** (`Record<string, any>`): Additional HTTP headers to send with requests

**fetchOptions** (`RequestInit`): Additional fetch options for HTTP requests

## Running a Chroma server

If you are a Chroma Cloud user, provide the `ChromaVector` constructor your API key, tenant, and database name.

When you install the `@mastra/chroma` package, you get access to the [Chroma CLI](https://docs.trychroma.com/docs/cli/db), which can set these as environment variables for you: `chroma db connect [DB-NAME] --env-file`.

Otherwise, you have several options for setting up your single-node Chroma server:

- Run one locally using the Chroma CLI: `chroma run`. You can find more configuration options on the [Chroma docs](https://docs.trychroma.com/docs/cli/run).
- Run on [Docker](https://docs.trychroma.com/guides/deploy/docker) using the official Chroma image.
- Deploy your own Chroma server on your provider of choice. Chroma offers example templates for [AWS](https://docs.trychroma.com/guides/deploy/aws), [Azure](https://docs.trychroma.com/guides/deploy/azure), and [GCP](https://docs.trychroma.com/guides/deploy/gcp).

## Methods

### `createIndex()`

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (Default: `cosine`)

### `forkIndex()`

Note: Forking is only supported on Chroma Cloud, or if you deploy your own OSS **distributed** Chroma.

`forkIndex` lets you fork an existing Chroma index instantly. Operations on the forked index don't affect the original one. Learn more on the [Chroma docs](https://docs.trychroma.com/cloud/collection-forking).

**indexName** (`string`): Name of the index to fork

**newIndexName** (`string`): The name of the forked index

### `upsert()`

**indexName** (`string`): Name of the index to upsert into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

**documents** (`string[]`): Chroma-specific: Original text documents associated with the vectors

### `query()`

Query an index using a `queryVector`. Returns an array of semantically similar records in order of distance from the `queryVector`. Each record has the shape:

```typescript
{
  id: string;
  score: number;
  document?: string;
  metadata?: Record<string, string | number | boolean>;
  embedding?: number[]
}
```

You can also provide the shape of your metadata to a `query` call for type inference: `query<T>()`.

**indexName** (`string`): Name of the index to query

**queryVector** (`number[]`): Query vector to find similar vectors

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters for the query

**includeVector** (`boolean`): Whether to include vectors in the results (Default: `false`)

**documentFilter** (`Record<string, any>`): Chroma-specific: Filter to apply on the document content

### `get()`

Get records from your Chroma index by IDs, metadata, and document filters. It returns an array of records of the shape:

```typescript
{
  id: string;
  document?: string;
  metadata?: Record<string, string | number | boolean>;
  embedding?: number[]
}
```

You can also provide the shape of your metadata to a `get` call for type inference: `get<T>()`.

**indexName** (`string`): Name of the index to query

**ids** (`string[]`): A list of record IDs to return. If not provided, all records are returned.

**filter** (`Record<string, any>`): Metadata filters.

**includeVector** (`boolean`): Whether to include vectors in the results (Default: `false`)

**documentFilter** (`Record<string, any>`): Chroma-specific: Filter to apply on the document content

**limit** (`number`): The maximum number of records to return (Default: `100`)

**offset** (`number`): Offset for returning records. Use with limit to paginate results.

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

**indexName** (`string`): Name of the index containing the vector to update

**id** (`string`): ID of the vector to update (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vector(s) to update (mutually exclusive with id)

**update** (`object`): Update parameters

The `update` object can contain:

**vector** (`number[]`): New vector to replace the existing one

**metadata** (`Record<string, any>`): New metadata to replace the existing metadata

Example:

```typescript
// Update by ID
await vectorStore.updateVector({
  indexName: 'docs',
  id: 'vec_123',
  update: { metadata: { status: 'reviewed' } },
})

// Update by filter
await vectorStore.updateVector({
  indexName: 'docs',
  filter: { source_id: 'manual.pdf' },
  update: { metadata: { version: 2 } },
})
```

### `deleteVector()`

**indexName** (`string`): Name of the index containing the vector to delete

**id** (`string`): ID of the vector to delete

### `deleteVectors()`

Delete multiple vectors by IDs or by metadata filter. The method supports bulk deletion and source-based vector management. Either `ids` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vectors to delete

**ids** (`string[]`): Array of vector IDs to delete (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vectors to delete (mutually exclusive with ids)

Example:

```typescript
// Delete all chunks from a document
await vectorStore.deleteVectors({
  indexName: 'docs',
  filter: { source_id: 'manual.pdf' },
})

// Delete multiple vectors by ID
await vectorStore.deleteVectors({
  indexName: 'docs',
  ids: ['vec_1', 'vec_2', 'vec_3'],
})

// Delete old temporary documents
await vectorStore.deleteVectors({
  indexName: 'docs',
  filter: {
    $and: [{ bucket: 'temp' }, { indexed_at: { $lt: '2025-01-01' } }],
  },
})
```

## Response types

Query results are returned in this format:

```typescript
interface QueryResult {
  id: string
  score: number
  metadata: Record<string, any>
  document?: string // Chroma-specific: Original document if it was stored
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