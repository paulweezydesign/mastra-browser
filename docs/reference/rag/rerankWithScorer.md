> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# rerankWithScorer()

The `rerankWithScorer()` function provides advanced reranking capabilities for vector search results by combining semantic relevance, vector similarity, and position-based scoring.

```typescript
function rerankWithScorer({
  results: QueryResult[],
  query: string,
  scorer: RelevanceScoreProvider,
  options?: RerankerFunctionOptions,
}): Promise<RerankResult[]>;
```

## Usage example

```typescript
import { rerankWithScorer as rerank, CohereRelevanceScorer } from '@mastra/rag'

const scorer = new CohereRelevanceScorer('rerank-v3.5')

const rerankedResults = await rerank({
  results: vectorSearchResults,
  query: 'How do I deploy to production?',
  scorer,
  options: {
    weights: {
      semantic: 0.5,
      vector: 0.3,
      position: 0.2,
    },
    topK: 3,
  },
})
```

## Parameters

**results** (`QueryResult[]`): The vector search results to rerank

**query** (`string`): The search query text used to evaluate relevance

**scorer** (`RelevanceScoreProvider`): The relevance scorer to use for reranking

**options** (`RerankerFunctionOptions`): Options for the reranking model

**options.weights** (`WeightConfig`): Weights for different scoring components (must add up to 1)

**options.weights.semantic** (`number (default: 0.4)`): Weight for semantic relevance

**options.weights.vector** (`number (default: 0.4)`): Weight for vector similarity

**options.weights.position** (`number (default: 0.2)`): Weight for position-based scoring

**options.queryEmbedding** (`number[]`): Embedding of the query

**options.topK** (`number`): Number of top results to return

The `rerankWithScorer` function accepts any `RelevanceScoreProvider` from @mastra/rag.

> **Note:** For semantic scoring to work properly during re-ranking, each result must include the text content in its `metadata.text` field.

## Returns

The function returns an array of `RerankResult` objects:

**result** (`QueryResult`): The original query result

**score** (`number`): Combined reranking score (0-1)

**details** (`ScoringDetails`): Detailed scoring information

### `ScoringDetails`

**semantic** (`number`): Semantic relevance score (0-1)

**vector** (`number`): Vector similarity score (0-1)

**position** (`number`): Position-based score (0-1)

**queryAnalysis** (`object`): Query analysis details

**queryAnalysis.magnitude**: Magnitude of the query

**queryAnalysis.dominantFeatures**: Dominant features of the query

## Related

- [createVectorQueryTool](https://mastra.ai/reference/tools/vector-query-tool)