> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Elasticsearch vector store

The `ElasticSearchVector` class provides vector search using [Elasticsearch](https://www.elastic.co/elasticsearch/) with its `dense_vector` field type and k-NN search capabilities. It's part of the `@mastra/elasticsearch` package.

## Installation

**npm**:

```bash
npm install @mastra/elasticsearch@latest
```

**pnpm**:

```bash
pnpm add @mastra/elasticsearch@latest
```

**Yarn**:

```bash
yarn add @mastra/elasticsearch@latest
```

**Bun**:

```bash
bun add @mastra/elasticsearch@latest
```

## Usage

```typescript
import { ElasticSearchVector } from "@mastra/elasticsearch";

const store = new ElasticSearchVector({
  id: "elasticsearch-vector",
  url: process.env.ELASTICSEARCH_URL,
});

// Create an index
await store.createIndex({
  indexName: "my-collection",
  dimension: 1536,
});

// Add vectors with metadata
const vectors = [[0.1, 0.2, ...], [0.3, 0.4, ...]];
const metadata = [
  { text: "first document", category: "A" },
  { text: "second document", category: "B" }
];
await store.upsert({
  indexName: "my-collection",
  vectors,
  metadata,
});

// Query similar vectors
const results = await store.query({
  indexName: "my-collection",
  queryVector: [0.1, 0.2, ...],
  topK: 10,
  filter: { category: "A" },
});
```

## Constructor options

**id** (`string`): Unique identifier for this vector store instance

**url** (`string`): Elasticsearch connection URL (e.g., 'http\://localhost:9200')

## Methods

### `createIndex()`

Creates a new index with the specified configuration.

**indexName** (`string`): Name of the index to create

**dimension** (`number`): Vector dimension (must match your embedding model)

**metric** (`'cosine' | 'euclidean' | 'dotproduct'`): Distance metric for similarity search (Default: `cosine`)

### `upsert()`

Adds or updates vectors and their metadata in the index.

**indexName** (`string`): Name of the index to insert into

**vectors** (`number[][]`): Array of embedding vectors

**metadata** (`Record<string, any>[]`): Metadata for each vector

**ids** (`string[]`): Optional vector IDs (auto-generated if not provided)

### `query()`

Searches for similar vectors with optional metadata filtering.

**indexName** (`string`): Name of the index to search in

**queryVector** (`number[]`): Query vector to find similar vectors for

**topK** (`number`): Number of results to return (Default: `10`)

**filter** (`Record<string, any>`): Metadata filters

**includeVector** (`boolean`): Whether to include vector data in results (Default: `false`)

### `describeIndex()`

Gets information about an index.

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

Lists all vector indexes.

Returns: `Promise<string[]>`

### `updateVector()`

Update a single vector by ID or by metadata filter. Either `id` or `filter` must be provided, but not both.

**indexName** (`string`): Name of the index containing the vector

**id** (`string`): ID of the vector to update (mutually exclusive with filter)

**filter** (`Record<string, any>`): Metadata filter to identify vector(s) to update (mutually exclusive with id)

**update** (`object`): Update data containing vector and/or metadata

**update.vector** (`number[]`): New vector data

**update.metadata** (`Record<string, any>`): New metadata

### `deleteVector()`

Deletes a single vector by its ID.

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

## Related

- [Metadata Filters](https://mastra.ai/reference/rag/metadata-filters)