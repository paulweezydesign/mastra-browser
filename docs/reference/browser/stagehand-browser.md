> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# StagehandBrowser class

The `StagehandBrowser` class provides AI-powered browser automation using [Stagehand](https://github.com/browserbase/stagehand). It uses natural language instructions for interactions instead of element refs.

Use `StagehandBrowser` when you want AI to interpret and execute browser actions from natural language. For deterministic automation using element refs, see [`AgentBrowser`](https://mastra.ai/reference/browser/agent-browser).

## Usage example

```typescript
import { Agent } from '@mastra/core/agent'
import { StagehandBrowser } from '@mastra/stagehand'

const browser = new StagehandBrowser({
  headless: true,
  model: 'openai/gpt-5.6-sol',
  selfHeal: true,
})

export const browserAgent = new Agent({
  id: 'browser-agent',
  name: 'Browser Agent',
  instructions: `You can browse the web using natural language.
Use stagehand_act to perform actions like "click the login button".
Use stagehand_extract to get data from pages.`,
  model: 'openai/gpt-5.6-sol',
  browser,
})
```

## Constructor parameters

**headless** (`boolean`): Whether to run the browser in headless mode. (Default: `true`)

**viewport** (`{ width: number; height: number } | 'window'`): Browser viewport dimensions. 'window' matches the real browser window and only applies when connecting over CDP; a locally launched browser falls back to the default size. (Default: `{ width: 1280, height: 720 }`)

**env** (`'LOCAL' | 'BROWSERBASE'`): Environment to run the browser in. Use 'BROWSERBASE' for cloud execution. (Default: `'LOCAL'`)

**apiKey** (`string`): Browserbase API key. Required when env is 'BROWSERBASE'.

**projectId** (`string`): Browserbase project ID. Required when env is 'BROWSERBASE'.

**model** (`string | ModelConfiguration`): Model configuration for AI operations. Can be a string like 'openai/gpt-5.5' or an object with modelName, apiKey, and baseURL. (Default: `'openai/gpt-5.5'`)

**selfHeal** (`boolean`): Enable self-healing selectors. When enabled, Stagehand uses AI to find elements even when initial selectors fail. (Default: `true`)

**domSettleTimeout** (`number`): Timeout in milliseconds for DOM to settle after actions. (Default: `5000`)

**verbose** (`0 | 1 | 2`): Logging verbosity level. 0 = silent, 1 = errors only, 2 = verbose. (Default: `1`)

**systemPrompt** (`string`): Custom system prompt for AI operations.

**cdpUrl** (`string | (() => string | Promise<string>)`): CDP WebSocket URL or HTTP endpoint for connecting to an existing browser. HTTP endpoints are resolved to WebSocket internally.

**scope** (`'shared' | 'thread'`): Browser instance scope across threads. (Default: `'thread' (or 'shared' when cdpUrl is provided)`)

**timeout** (`number`): Default timeout in milliseconds for Stagehand operations. (Default: `30000`)

**onLaunch** (`(args: { browser: MastraBrowser }) => void | Promise<void>`): Callback invoked after the browser is ready.

**onClose** (`(args: { browser: MastraBrowser }) => void | Promise<void>`): Callback invoked before the browser closes.

**screencast** (`ScreencastOptions`): Configuration for streaming browser frames to Studio.

**recording** (`BrowserRecordingOptions`): Alpha option for adding browser recording tools. Provide outputDir to add browser\_record and browser\_record\_caption to the toolset. You can also set maxDurationMs, maxWidth, and maxHeight as defaults for every recording.

**excludeTools** (`StagehandToolName[]`): Tool names to exclude from the browser toolset. Use this to disable specific tools for models that do not support certain capabilities, such as vision.

## Tools

`StagehandBrowser` provides 7 AI-powered tools for browser automation.

When `recording` is configured, `StagehandBrowser` also adds the alpha `browser_record` and `browser_record_caption` tools. See [Browser recording (alpha)](https://mastra.ai/docs/browser/recording).

Core tools:

| Tool                   | Description                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `stagehand_act`        | Perform actions using natural language instructions                                   |
| `stagehand_extract`    | Extract structured data from pages                                                    |
| `stagehand_observe`    | Discover useful elements on a page                                                    |
| `stagehand_navigate`   | Navigate to a URL                                                                     |
| `stagehand_tabs`       | Manage browser tabs                                                                   |
| `stagehand_screenshot` | Capture a screenshot as PNG (viewport by default; set `fullPage: true` for full page) |
| `stagehand_close`      | Close the browser                                                                     |

To exclude specific tools, pass `excludeTools` in the constructor:

```typescript
const browser = new StagehandBrowser({
  excludeTools: ['stagehand_screenshot'],
})
```

## Tool reference

### `stagehand_act`

Perform an action using natural language instructions. The AI interprets your instruction and executes the appropriate browser action.

```text
// Tool input
{
  "instruction": "click the login button",
  "variables": { "username": "john" },
  "useVision": true,
  "timeout": 30000
}

// With variable substitution
{
  "instruction": "type %email% into the email field",
  "variables": { "email": "user@example.com" }
}
```

| Parameter     | Type                     | Description                                          |
| ------------- | ------------------------ | ---------------------------------------------------- |
| `instruction` | `string`                 | Natural language instruction (required)              |
| `variables`   | `Record<string, string>` | Variables for %variableName% substitution (optional) |
| `useVision`   | `boolean`                | Enable vision capabilities (optional)                |
| `timeout`     | `number`                 | Timeout in ms (optional)                             |

**Returns:**

```typescript
interface ActResult {
  success: boolean
  message?: string
  action?: string
  url?: string
}
```

### `stagehand_extract`

Extract structured data from a page using natural language instructions.

```text
// Basic extraction
{
  "instruction": "extract all product names and prices"
}

// With schema for structured output
{
  "instruction": "extract the product information",
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "price": { "type": "number" },
      "inStock": { "type": "boolean" }
    }
  }
}
```

**Returns:**

```typescript
interface ExtractResult<T = unknown> {
  success: boolean
  data?: T
  hint?: string
  error?: string
  url?: string
}
```

### `stagehand_observe`

Discover useful elements on a page. Returns a list of elements with their selectors and descriptions.

```text
// Find specific elements
{
  "instruction": "find all buttons related to checkout"
}

// Find all interactive elements
{
  "onlyVisible": true
}
```

| Parameter     | Type      | Description                                               |
| ------------- | --------- | --------------------------------------------------------- |
| `instruction` | `string`  | Natural language instruction (optional, omit to find all) |
| `onlyVisible` | `boolean` | Only include visible elements (optional)                  |
| `timeout`     | `number`  | Timeout in ms (optional)                                  |

**Returns:**

```typescript
interface ObserveResult {
  success: boolean
  actions: StagehandAction[]
  url?: string
}

interface StagehandAction {
  selector: string
  description: string
  method?: string
  arguments?: string[]
}
```

### `stagehand_navigate`

Navigate to a URL.

```text
// Tool input
{
  "url": "https://example.com",
  "waitUntil": "domcontentloaded"
}
```

| Parameter   | Type                                            | Description                                     |
| ----------- | ----------------------------------------------- | ----------------------------------------------- |
| `url`       | `string`                                        | URL to open (required)                          |
| `waitUntil` | `"load" \| "domcontentloaded" \| "networkidle"` | When to consider navigation complete (optional) |

### `stagehand_tabs`

Manage browser tabs.

```text
// List all tabs
{ "action": "list" }

// Open new tab
{ "action": "new", "url": "https://example.com" }

// Switch to tab by index
{ "action": "switch", "index": 0 }

// Close tab by index (or current if omitted)
{ "action": "close", "index": 1 }
```

### `stagehand_screenshot`

Capture a screenshot of the current page as PNG (viewport by default. Set `fullPage: true` for full-page capture). Returns image content that vision-capable models can interpret directly. Use `stagehand_observe` or `stagehand_extract` when you only need text or structured data.

```text
// Viewport only (default)

// Full scrollable page
{ "fullPage": true }
```

| Parameter  | Type      | Description                                                                              |
| ---------- | --------- | ---------------------------------------------------------------------------------------- |
| `fullPage` | `boolean` | Capture the full scrollable page instead of only the viewport (optional, default: false) |

### `stagehand_close`

Close the browser and clean up resources.

```text
// Tool input (no parameters required)

```

## Using Browserbase

Run Stagehand in the cloud using Browserbase:

```typescript
const browser = new StagehandBrowser({
  env: 'BROWSERBASE',
  apiKey: process.env.BROWSERBASE_API_KEY,
  projectId: process.env.BROWSERBASE_PROJECT_ID,
  model: 'openai/gpt-5.6-sol',
})
```

## Model configuration

Configure the AI model for Stagehand operations:

```typescript
// String format: "provider/model"
const browser = new StagehandBrowser({
  model: 'openai/gpt-5.6-sol',
})

// Object format for custom configuration
const browser = new StagehandBrowser({
  model: {
    modelName: 'gpt-5.4',
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
  },
})
```

## AgentBrowser vs StagehandBrowser

| Aspect          | AgentBrowser               | StagehandBrowser      |
| --------------- | -------------------------- | --------------------- |
| **Approach**    | Deterministic refs (`@e5`) | Natural language      |
| **Precision**   | Exact element targeting    | AI interpretation     |
| **Flexibility** | Requires a snapshot first  | Direct instructions   |
| **Use case**    | Reproducible automation    | Adaptive automation   |
| **Speed**       | Faster (no AI inference)   | Slower (AI inference) |

Choose `AgentBrowser` for precise, reproducible automation. Choose `StagehandBrowser` for flexible, natural language interactions.

## Related

- [MastraBrowser](https://mastra.ai/reference/browser/mastra-browser): Base class reference
- [AgentBrowser](https://mastra.ai/reference/browser/agent-browser): Deterministic alternative
- [Browser overview](https://mastra.ai/docs/browser/overview): Conceptual guide
- [Stagehand guide](https://mastra.ai/docs/browser/stagehand): Usage guide