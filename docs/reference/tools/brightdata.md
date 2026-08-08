> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Bright Data tools

The `@mastra/brightdata` package wraps the [Bright Data SDK](https://github.com/brightdata/bright-data-sdk-node) as Mastra-compatible tools. It exposes factory functions for web search and web fetch. Each function returns a tool created with [`createTool()`](https://mastra.ai/reference/tools/create-tool) that includes full Zod input/output schemas.

The search tool is backed by Bright Data's [SERP API](https://brightdata.com/products/serp-api) and the fetch tool by [Web Unlocker](https://brightdata.com/products/web-unlocker). Both bypass bot detection and CAPTCHAs.

## Installation

**npm**:

```sh
npm install @mastra/brightdata zod
```

**pnpm**:

```sh
pnpm add @mastra/brightdata zod
```

**Yarn**:

```sh
yarn add @mastra/brightdata zod
```

**Bun**:

```sh
bun add @mastra/brightdata zod
```

## Quick start

Use `createBrightDataTools()` to get both tools with shared configuration:

```typescript
import { createBrightDataTools } from '@mastra/brightdata'

const { webSearch, webFetch } = createBrightDataTools()
// Or pass an explicit API key:
// const { webSearch, webFetch } = createBrightDataTools({ apiKey: 'brd-...' })
```

Each tool can also be created individually:

```typescript
import { createBrightDataSearchTool, createBrightDataFetchTool } from '@mastra/brightdata'

const searchTool = createBrightDataSearchTool()
const fetchTool = createBrightDataFetchTool({ apiKey: 'brd-...' })
```

By default, all tools read `BRIGHTDATA_API_TOKEN` from the environment. You can pass `{ apiKey }` explicitly to override.

## Configuration

All factory functions accept `BrightDataClientOptions` from `@brightdata/sdk`:

**apiKey** (`string`): Bright Data API token. Falls back to the BRIGHTDATA\_API\_TOKEN environment variable.

Additional fields supported by the `bdclient` constructor (such as `timeout`, `webUnlockerZone`, `serpZone`, and `rateLimit`) can be passed through the same options object.

## `createBrightDataTools()`

Returns an object containing both tools with a shared configuration.

```typescript
import { createBrightDataTools } from '@mastra/brightdata'

const tools = createBrightDataTools({ apiKey: 'brd-...' })
// tools.webSearch, tools.webFetch
```

**Returns:** `{ webSearch, webFetch }`

## `createBrightDataSearchTool()`

Creates a tool that searches Google through Bright Data's SERP API. Returns parsed organic results.

**Tool ID:** `brightdata-search`

```typescript
import { createBrightDataSearchTool } from '@mastra/brightdata'

const searchTool = createBrightDataSearchTool()
```

### Input

**query** (`string`): The search query.

**country** (`string`): Two-letter country code for geo-targeted results (for example, us or gb).

**start** (`number`): Result offset for pagination. For example, 10 returns the second page of 10 results.

### Output

**query** (`string`): The original search query.

**results** (`SearchResult[]`): Organic search results. Entries missing a link or title are filtered out.

**results.link** (`string`): Result URL.

**results.title** (`string`): Result title.

**results.description** (`string`): Result snippet.

**currentPage** (`number`): Page number returned by the SERP API. Defaults to 1 when the upstream response omits or returns a non-positive value.

## `createBrightDataFetchTool()`

Creates a tool that fetches a webpage through Bright Data's Web Unlocker and returns the page content as Markdown.

**Tool ID:** `brightdata-fetch`

```typescript
import { createBrightDataFetchTool } from '@mastra/brightdata'

const fetchTool = createBrightDataFetchTool()
```

### Input

**url** (`string`): The URL to fetch. Must be a valid HTTP or HTTPS URL.

### Output

**url** (`string`): The input URL.

**content** (`string`): Page content as Markdown.

## Agent example

The following example demonstrates a research agent that combines search and fetch:

```typescript
import { Agent } from '@mastra/core/agent'
import { createBrightDataTools } from '@mastra/brightdata'

const { webSearch, webFetch } = createBrightDataTools()

const agent = new Agent({
  id: 'research-agent',
  name: 'Research Agent',
  model: 'anthropic/claude-sonnet-4-6',
  instructions:
    'You are a research assistant. Use the search tool to find relevant pages, then use the fetch tool to read full Markdown content from the best results.',
  tools: {
    webSearch,
    webFetch,
  },
})
```

## Environment variables

| Variable               | Description                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| `BRIGHTDATA_API_TOKEN` | Your Bright Data API token. Used as the default when `apiKey` isn't passed to a factory function. |

## Related

- [`createTool()`](https://mastra.ai/reference/tools/create-tool)
- [Bright Data SERP API](https://brightdata.com/products/serp-api)
- [Bright Data Web Unlocker](https://brightdata.com/products/web-unlocker)
- [Bright Data SDK for Node.js](https://github.com/brightdata/bright-data-sdk-node)