> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Perplexity tools

The `@mastra/perplexity` package wraps the [Perplexity Search API](https://docs.perplexity.ai/docs/search/quickstart) as a Mastra-compatible tool. It exposes a factory function that returns a tool created with [`createTool()`](https://mastra.ai/reference/tools/create-tool) and full Zod input/output schemas.

For chat completions or agentic workflows powered by Perplexity, use Mastra's built-in [Perplexity model provider](https://mastra.ai/models/providers/perplexity) or [Perplexity Agent provider](https://mastra.ai/models/providers/perplexity-agent). Those are separate from this Search tool.

## Installation

Install the package alongside Zod:

**npm**:

```sh
npm install @mastra/perplexity zod
```

**pnpm**:

```sh
pnpm add @mastra/perplexity zod
```

**Yarn**:

```sh
yarn add @mastra/perplexity zod
```

**Bun**:

```sh
bun add @mastra/perplexity zod
```

## Usage example

The following example creates the search tool with the default configuration. By default, the tool reads `PERPLEXITY_API_KEY` (with `PPLX_API_KEY` as a fallback) from the environment. Pass `{ apiKey }` explicitly to override.

```typescript
import { createPerplexitySearchTool } from '@mastra/perplexity'

const searchTool = createPerplexitySearchTool()
```

To pass an API key explicitly:

```typescript
import { createPerplexitySearchTool } from '@mastra/perplexity'

const searchTool = createPerplexitySearchTool({ apiKey: 'pplx-...' })
```

## Configuration

All factory functions accept a `PerplexityClientOptions` object:

**apiKey** (`string`): Perplexity API key. Falls back to the PERPLEXITY\_API\_KEY then PPLX\_API\_KEY environment variables.

**baseUrl** (`string`): Override the API base URL. (Default: `'https://api.perplexity.ai'`)

**fetch** (`typeof fetch`): Custom fetch implementation. Useful for tests, retries, or instrumentation.

## Methods

### Factory functions

#### `createPerplexityTools(config?)`

Returns an object containing all Perplexity tools that share the supplied configuration.

```typescript
import { createPerplexityTools } from '@mastra/perplexity'

const tools = createPerplexityTools({ apiKey: 'pplx-...' })
// tools.perplexitySearch
```

Returns: `{ perplexitySearch }`

#### `createPerplexitySearchTool(config?)`

Creates a tool that searches the web using the Perplexity Search API. Returns ranked results with titles, URLs, snippets, and optional publication dates.

The tool is registered with the ID `perplexity-search`.

```typescript
import { createPerplexitySearchTool } from '@mastra/perplexity'

const searchTool = createPerplexitySearchTool()
```

##### Input

**query** (`string`): The search query.

**maxResults** (`number`): Maximum number of results to return (1-20).

**searchDomainFilter** (`string[]`): Restrict (or exclude) results by domain. Prefix a domain with - to exclude it (for example, -pinterest.com). Do not mix allow- and deny-list entries in the same call.

**searchRecencyFilter** (`'hour' | 'day' | 'week' | 'month' | 'year'`): Only return results from within the given recency window.

**searchAfterDateFilter** (`string`): Only return results published on or after this date. Format: m/d/yyyy.

**searchBeforeDateFilter** (`string`): Only return results published on or before this date. Format: m/d/yyyy.

##### Output

**query** (`string`): The original search query.

**results** (`SearchResult[]`): Array of search results.

**results.title** (`string`): Result title.

**results.url** (`string`): Result URL.

**results.snippet** (`string`): Content snippet.

**results.date** (`string`): Publication date when available.

## Agent example

The following example registers the search tool on an agent so it can fetch fresh web results before answering.

```typescript
import { Agent } from '@mastra/core/agent'
import { createPerplexitySearchTool } from '@mastra/perplexity'

const agent = new Agent({
  id: 'research-agent',
  name: 'Research Agent',
  model: 'anthropic/claude-sonnet-4-6',
  instructions:
    'You are a research assistant. Use the perplexity-search tool to find up-to-date information from the web before answering.',
  tools: {
    search: createPerplexitySearchTool(),
  },
})
```

## Environment variables

| Variable             | Description                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `PERPLEXITY_API_KEY` | Your Perplexity API key. Used as the default when `apiKey` isn't passed to a factory function. |
| `PPLX_API_KEY`       | Fallback used when `PERPLEXITY_API_KEY` is unset.                                              |

## Related

- [`createTool()`](https://mastra.ai/reference/tools/create-tool)
- [Perplexity Search quickstart](https://docs.perplexity.ai/docs/search/quickstart)
- [Perplexity Agent quickstart](https://docs.perplexity.ai/docs/agent/quickstart)
- [Perplexity model provider](https://mastra.ai/models/providers/perplexity)
- [Perplexity Agent provider](https://mastra.ai/models/providers/perplexity-agent)