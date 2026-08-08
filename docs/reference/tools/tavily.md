> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Tavily tools

The `@mastra/tavily` package wraps the [Tavily](https://app.tavily.com) API as Mastra-compatible tools. It exposes factory functions for search, extract, crawl, and map. Each function returns a tool created with [`createTool()`](https://mastra.ai/reference/tools/create-tool) that includes full Zod input/output schemas.

## Installation

**npm**:

```sh
npm install @mastra/tavily @tavily/core zod
```

**pnpm**:

```sh
pnpm add @mastra/tavily @tavily/core zod
```

**Yarn**:

```sh
yarn add @mastra/tavily @tavily/core zod
```

**Bun**:

```sh
bun add @mastra/tavily @tavily/core zod
```

## Quick start

Use `createTavilyTools()` to get all four tools with shared configuration:

```typescript
import { createTavilyTools } from '@mastra/tavily'

const tools = createTavilyTools()
// Or pass an explicit API key:
// const tools = createTavilyTools({ apiKey: 'tvly-...' })
```

Each tool can also be created individually:

```typescript
import { createTavilySearchTool, createTavilyExtractTool } from '@mastra/tavily'

const searchTool = createTavilySearchTool()
const extractTool = createTavilyExtractTool({ apiKey: 'tvly-...' })
```

By default, all tools read `TAVILY_API_KEY` from the environment. You can pass `{ apiKey }` explicitly to override.

## Configuration

All factory functions accept `TavilyClientOptions` from `@tavily/core`:

**apiKey** (`string`): Tavily API key. Falls back to the TAVILY\_API\_KEY environment variable.

**clientName** (`string`): Attribution string sent with each request in the X-Client-Name header. (Default: `'mastra'`)

**apiBaseURL** (`string`): Base URL for the Tavily API.

**proxies** (`object`): Proxy configuration passed to the underlying HTTP client.

**projectId** (`string`): Tavily project ID for request scoping.

## `createTavilyTools()`

Returns an object containing all four tools with a shared configuration.

```typescript
import { createTavilyTools } from '@mastra/tavily'

const tools = createTavilyTools({ apiKey: 'tvly-...' })
// tools.tavilySearch, tools.tavilyExtract, tools.tavilyCrawl, tools.tavilyMap
```

**Returns:** `{ tavilySearch, tavilyExtract, tavilyCrawl, tavilyMap }`

## `createTavilySearchTool()`

Creates a tool that searches the web using Tavily. Returns relevant results with content snippets, optional AI-generated answers, and images.

**Tool ID:** `tavily-search`

```typescript
import { createTavilySearchTool } from '@mastra/tavily'

const searchTool = createTavilySearchTool()
```

### Input

**query** (`string`): The search query.

**searchDepth** (`'basic' | 'advanced' | 'fast' | 'ultra-fast'`): Search depth. Use 'basic' for standard results, 'advanced' for more thorough results, or 'fast'/'ultra-fast' for low latency.

**maxResults** (`number`): Maximum number of results to return (1-20).

**includeAnswer** (`boolean | 'basic' | 'advanced'`): Include an AI-generated answer summary.

**includeImages** (`boolean`): Include query-related images in the response.

**includeImageDescriptions** (`boolean`): Include descriptions for returned images.

**includeRawContent** (`false | 'markdown' | 'text'`): Include cleaned HTML content of each result. Pass false to disable, or 'markdown'/'text' for format.

**includeDomains** (`string[]`): Restrict results to these domains.

**excludeDomains** (`string[]`): Exclude results from these domains.

**timeRange** (`'day' | 'week' | 'month' | 'year'`): Filter results by recency.

### Output

**query** (`string`): The original search query.

**answer** (`string`): AI-generated answer summary.

**images** (`{ url: string; description?: string }[]`): Related images.

**results** (`SearchResult[]`): Array of search results.

**results.title** (`string`): Result title.

**results.url** (`string`): Result URL.

**results.content** (`string`): Content snippet.

**results.score** (`number`): Relevance score.

**results.rawContent** (`string`): Full-page content (when requested).

**responseTime** (`number`): Server response time in seconds.

## `createTavilyExtractTool()`

Creates a tool that extracts content from one or more URLs. Returns raw page content in markdown or text format with up to 20 URLs per request.

**Tool ID:** `tavily-extract`

```typescript
import { createTavilyExtractTool } from '@mastra/tavily'

const extractTool = createTavilyExtractTool()
```

### Input

**urls** (`string[]`): URLs to extract content from (1-20).

**extractDepth** (`'basic' | 'advanced'`): Extraction depth. Use 'advanced' to retrieve tables and embedded content.

**query** (`string`): User intent for reranking extracted content chunks by relevance.

**includeImages** (`boolean`): Include images extracted from the pages.

**format** (`'markdown' | 'text'`): Output format for extracted content. (Default: `'markdown'`)

### Output

**results** (`ExtractResult[]`): Successfully extracted pages.

**results.url** (`string`): Page URL.

**results.rawContent** (`string`): Extracted page content.

**results.images** (`string[]`): Extracted image URLs.

**failedResults** (`FailedResult[]`): URLs that failed extraction.

**failedResults.url** (`string`): Failed URL.

**failedResults.error** (`string`): Error message.

**responseTime** (`number`): Server response time in seconds.

## `createTavilyCrawlTool()`

Creates a tool that crawls a website starting from a URL. Extracts content from discovered pages with configurable depth, breadth, and domain constraints.

**Tool ID:** `tavily-crawl`

```typescript
import { createTavilyCrawlTool } from '@mastra/tavily'

const crawlTool = createTavilyCrawlTool()
```

### Input

**url** (`string`): The root URL to begin the crawl.

**maxDepth** (`number`): Maximum depth of the crawl from the base URL.

**maxBreadth** (`number`): Maximum number of links to follow per page.

**limit** (`number`): Total number of pages the crawler processes before stopping.

**instructions** (`string`): Natural language instructions for the crawler.

**selectPaths** (`string[]`): Regex patterns to select specific URL paths.

**selectDomains** (`string[]`): Regex patterns to restrict to specific domains.

**excludePaths** (`string[]`): Regex patterns to exclude specific URL paths.

**excludeDomains** (`string[]`): Regex patterns to exclude specific domains.

**allowExternal** (`boolean`): Whether to follow links to external domains.

**extractDepth** (`'basic' | 'advanced'`): Extraction depth. Use 'advanced' to retrieve tables and embedded content.

**includeImages** (`boolean`): Include images from crawled pages.

**format** (`'markdown' | 'text'`): Output format for extracted content. (Default: `'markdown'`)

### Output

**baseUrl** (`string`): The root URL that was crawled.

**results** (`CrawlResult[]`): Content extracted from discovered pages.

**results.url** (`string`): Page URL.

**results.rawContent** (`string`): Extracted page content.

**results.images** (`string[]`): Image URLs found on the page.

**responseTime** (`number`): Server response time in seconds.

## `createTavilyMapTool()`

Creates a tool that maps a website's structure starting from a URL. Discovers and returns a list of URLs without extracting page content. Use this to understand site structure before targeted extraction.

**Tool ID:** `tavily-map`

```typescript
import { createTavilyMapTool } from '@mastra/tavily'

const mapTool = createTavilyMapTool()
```

### Input

**url** (`string`): The root URL to begin mapping.

**maxDepth** (`number`): Maximum depth of the mapping from the base URL.

**maxBreadth** (`number`): Maximum number of links to follow per page.

**limit** (`number`): Total number of links the mapper processes before stopping.

**instructions** (`string`): Natural language instructions for the mapper.

**selectPaths** (`string[]`): Regex patterns to select specific URL paths.

**selectDomains** (`string[]`): Regex patterns to restrict to specific domains.

**excludePaths** (`string[]`): Regex patterns to exclude specific URL paths.

**excludeDomains** (`string[]`): Regex patterns to exclude specific domains.

**allowExternal** (`boolean`): Whether to include external domain links.

### Output

**baseUrl** (`string`): The root URL that was mapped.

**results** (`string[]`): Discovered URLs.

**responseTime** (`number`): Server response time in seconds.

## Agent example

The following example demonstrates a research agent that combines search and extract:

```typescript
import { Agent } from '@mastra/core/agent'
import { createTavilySearchTool, createTavilyExtractTool } from '@mastra/tavily'

const agent = new Agent({
  id: 'web-search-agent',
  name: 'Web Search Agent',
  model: 'anthropic/claude-sonnet-4-6',
  instructions:
    'You are a web search assistant. Use search tool to find relevant pages, then use extract tool to get full content from the best results.',
  tools: {
    search: createTavilySearchTool(),
    extract: createTavilyExtractTool(),
  },
})
```

## Environment variables

| Variable         | Description                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `TAVILY_API_KEY` | Your Tavily API key. Used as the default when `apiKey` isn't passed to a factory function. |

## Related

- [`createTool()`](https://mastra.ai/reference/tools/create-tool)
- [Tavily API documentation](https://docs.tavily.com)