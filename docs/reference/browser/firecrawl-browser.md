> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# FirecrawlBrowser class

The `FirecrawlBrowser` class provides browser automation backed by the [Firecrawl Browser Sandbox](https://docs.firecrawl.dev/features/browser). It provisions remote browser sessions through the Firecrawl API and connects to them over the Chrome DevTools Protocol (CDP).

`FirecrawlBrowser` extends [`AgentBrowser`](https://mastra.ai/reference/browser/agent-browser) and exposes the same deterministic toolset. Use it when you want hosted browser sessions instead of a local Chromium install. For local automation, see [`AgentBrowser`](https://mastra.ai/reference/browser/agent-browser). For AI-powered interactions using natural language, see [`StagehandBrowser`](https://mastra.ai/reference/browser/stagehand-browser).

## Usage example

```typescript
import { Agent } from '@mastra/core/agent'
import { FirecrawlBrowser } from '@mastra/browser-firecrawl'

const browser = new FirecrawlBrowser({
  apiKey: process.env.FIRECRAWL_API_KEY,
  firecrawl: {
    ttl: 600,
  },
})

export const browserAgent = new Agent({
  id: 'browser-agent',
  name: 'Browser Agent',
  instructions: `You can browse the web. Use browser_snapshot to see the page structure,
then interact with elements using their refs (e.g., @e5).`,
  model: 'openai/gpt-5.6-sol',
  browser,
})
```

## Constructor parameters

`FirecrawlBrowser` accepts all [`AgentBrowser` constructor parameters](https://mastra.ai/reference/browser/agent-browser) plus the following:

**apiKey** (`string`): Firecrawl API key. Falls back to the FIRECRAWL\_API\_KEY environment variable. The constructor throws if neither is set.

**apiUrl** (`string`): Base URL for a self-hosted Firecrawl API.

**firecrawl** (`FirecrawlBrowserSessionOptions`): Session options passed to the Firecrawl browser() API when creating sandbox sessions.

**firecrawl.ttl** (`number`): Maximum session lifetime in seconds.

**firecrawl.activityTtl** (`number`): Idle timeout in seconds before the sandbox recycles the session.

**firecrawl.streamWebView** (`boolean`): When true, Firecrawl may stream WebView frames for the remote session.

**firecrawl.profile** (`{ name: string; saveChanges?: boolean }`): Named Firecrawl sandbox profile. Set saveChanges: true to persist cookies and login state when the session ends; naming a profile alone does not save changes. Distinct from the top-level AgentBrowser profile option, which is a local Playwright user-data directory path.

**firecrawl.integration** (`string`): Integration label for Firecrawl analytics and routing.

**firecrawl.origin** (`string`): Origin hint for the Firecrawl browser session.

## Session lifecycle

Session provisioning depends on the `scope` option inherited from `AgentBrowser`:

- `'thread'` (default): Each conversation thread gets its own Firecrawl sandbox session, created on first use and deleted when the thread's browser session is destroyed.
- `'shared'`: One Firecrawl sandbox session is created when the browser launches and shared across all threads. The session is deleted when the browser closes.

In both cases, `FirecrawlBrowser` deletes the remote Firecrawl session when the browser closes, including when session creation or connection fails partway through.

## Tools

`FirecrawlBrowser` provides the same toolset as `AgentBrowser`, including `browser_goto`, `browser_snapshot`, `browser_click`, `browser_type`, and `browser_screenshot`. See the [`AgentBrowser` tool reference](https://mastra.ai/reference/browser/agent-browser) for the full list and tool parameters.

## Related

- [Firecrawl docs](https://mastra.ai/docs/browser/firecrawl)
- [`AgentBrowser` reference](https://mastra.ai/reference/browser/agent-browser)
- [Browser overview](https://mastra.ai/docs/browser/overview)