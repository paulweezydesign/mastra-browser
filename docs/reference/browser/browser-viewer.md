> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# BrowserViewer

The `BrowserViewer` class provides browser automation for CLI-based tools. It launches Chrome via Playwright, exposes a Chrome DevTools Protocol (CDP) URL, and automatically injects it into CLI commands run through workspace tools.

Use `BrowserViewer` when your agent drives a browser through a CLI tool like `browser-use`, `agent-browser`, or `browse`. For SDK-based browser automation, use [`AgentBrowser`](https://mastra.ai/reference/browser/agent-browser) or [`StagehandBrowser`](https://mastra.ai/reference/browser/stagehand-browser).

## Usage example

```typescript
import { Workspace, LocalSandbox } from '@mastra/core/workspace'
import { Memory } from '@mastra/memory'
import { BrowserViewer } from '@mastra/browser-viewer'
import { Agent } from '@mastra/core/agent'

const workspace = new Workspace({
  sandbox: new LocalSandbox({
    workingDirectory: './workspace',
  }),
  browser: new BrowserViewer({
    cli: 'browser-use',
    headless: false,
  }),
})

const browserAgent = new Agent({
  id: 'browser-agent',
  model: 'openai/gpt-5.6-sol',
  workspace,
  instructions: 'You are a web automation assistant.',
  memory: new Memory(),
})
```

### Connecting to an existing browser

```typescript
const viewer = new BrowserViewer({
  cli: 'browser-use',
  cdpUrl: 'ws://127.0.0.1:9222/devtools/browser/abc123',
})
```

When `cdpUrl` is provided, `BrowserViewer` connects to the existing browser instead of launching a new one. Scope defaults to `'shared'`.

## Constructor parameters

**cli** (`'agent-browser' | 'browser-use' | 'browse' | 'browse-cli'`): Which CLI the agent uses for browser automation. The CLI connects to Chrome via the CDP URL.

**headless** (`boolean`): Whether to run Chrome in headless mode. (Default: `true`)

**cdpUrl** (`string | (() => string | Promise<string>)`): CDP WebSocket URL for connecting to an existing browser instead of launching one.

**cdpPort** (`number`): Port for Chrome remote debugging. Only used when launching Chrome (not when connecting via cdpUrl). (Default: `0 (auto-assign)`)

**scope** (`'shared' | 'thread'`): Browser instance scope. 'thread' gives each thread its own browser. 'shared' shares one browser across all threads. Defaults to 'shared' when cdpUrl is provided. (Default: `'thread'`)

**viewport** (`{ width: number; height: number }`): Browser viewport dimensions. (Default: `{ width: 1280, height: 720 }`)

**executablePath** (`string`): Path to a Chrome executable. Uses Playwright's bundled Chromium by default.

**onLaunch** (`(args: { browser: MastraBrowser }) => void | Promise<void>`): Callback invoked after the browser is ready.

**onClose** (`(args: { browser: MastraBrowser }) => void | Promise<void>`): Callback invoked before the browser closes.

**screencast** (`ScreencastOptions`): Configuration for streaming browser frames to Studio.

## Properties

**id** (`string`): Unique identifier for this browser instance. Generated as 'browser-viewer-{timestamp}'.

**name** (`string`): 'BrowserViewer'

**provider** (`string`): 'browser-viewer'

**providerType** (`'cli'`): Always 'cli'. Distinguishes BrowserViewer from SDK-based providers like AgentBrowser.

**cli** (`'agent-browser' | 'browser-use' | 'browse' | 'browse-cli'`): The CLI provider this instance is configured for.

**status** (`BrowserStatus`): Current browser status: 'pending', 'launching', 'ready', 'error', 'closing', or 'closed'.

## Methods

### Lifecycle

#### `launch(threadId?)`

Launches Chrome. For `'shared'` scope, launches a single shared browser. For `'thread'` scope, launches a browser for the specified thread.

```typescript
await viewer.launch()
await viewer.launch('thread-123')
```

#### `ensureReady()`

Ensures the browser is launched and ready. For `'thread'` scope, creates a new browser for the current thread if needed.

```typescript
await viewer.ensureReady()
```

#### `isBrowserRunning(threadId?)`

Checks if a browser is running. For `'thread'` scope, checks the specified thread.

```typescript
const running = viewer.isBrowserRunning()
const threadRunning = viewer.isBrowserRunning('thread-123')
```

Returns: `boolean`

#### `close()`

Closes all browser instances and cleans up resources.

```typescript
await viewer.close()
```

### CDP access

#### `getCdpUrl(threadId?)`

Returns the CDP WebSocket URL for the current or specified thread. CLI tools use this URL to connect to the managed browser.

```typescript
const cdpUrl = viewer.getCdpUrl()
// => 'ws://127.0.0.1:52481/devtools/browser/abc...'
```

Returns: `string | null`

#### `connectToExternalCdp(cdpUrl, threadId?)`

Connects to an external browser via CDP URL for screencast. Use this when the agent provides its own browser endpoint (for example, a cloud browser service). BrowserViewer connects for screencast without managing the browser lifecycle.

```typescript
await viewer.connectToExternalCdp('wss://cloud.example.com/session', 'thread-123')
```

### Screencast

#### `startScreencast(options?)`

Starts streaming browser frames. Returns a `ScreencastStream` that emits frame events. Handles tab switching automatically by creating fresh CDP sessions when tabs change.

```typescript
const stream = await viewer.startScreencast({
  format: 'jpeg',
  quality: 80,
})

stream.on('frame', frame => {
  console.log('Frame received:', frame.data.length, 'bytes')
})

stream.on('stop', reason => {
  console.log('Screencast stopped:', reason)
})
```

Returns: `Promise<ScreencastStream>`

### Input injection

#### `injectMouseEvent(params, threadId?)`

Injects a mouse event into the browser via CDP. Used by Studio for live interaction.

```typescript
await viewer.injectMouseEvent({
  type: 'mousePressed',
  x: 100,
  y: 200,
  button: 'left',
  clickCount: 1,
})
```

#### `injectKeyboardEvent(params, threadId?)`

Injects a keyboard event into the browser via CDP. Used by Studio for live interaction.

```typescript
await viewer.injectKeyboardEvent({
  type: 'keyDown',
  key: 'Enter',
  code: 'Enter',
})
```

## Supported CLIs

Each CLI must be installed separately. Each also publishes a [skill](https://mastra.ai/docs/workspace/skills) that teaches the agent its commands and workflows. When a CLI command runs through `workspace_execute_command`, Mastra detects it and injects the CDP URL automatically using the correct flag.

Unlike SDK providers, `BrowserViewer` doesn't provide agent tools. The agent uses CLI commands through `workspace_execute_command` instead.

### [`agent-browser`](https://www.npmjs.com/package/agent-browser)

Config value: `'agent-browser'` · CDP flag: `--cdp`

```bash
npm install -g agent-browser
npx skills add vercel-labs/agent-browser
```

### [`browser-use`](https://pypi.org/project/browser-use/)

Config value: `'browser-use'` · CDP flag: `--cdp-url`

```bash
pip install browser-use
npx skills add browser-use/browser-use --skill browser-use
```

### [`browse`](https://www.npmjs.com/package/browse) (command: `browse`)

Config value: `'browse'` · CDP flag: `--ws`

```bash
npm install -g browse
browse skills install
```

## Related

- [BrowserViewer guide](https://mastra.ai/docs/browser/browser-viewer): Setup and usage walkthrough
- [MastraBrowser](https://mastra.ai/reference/browser/mastra-browser): Base class API reference
- [Workspace overview](https://mastra.ai/docs/workspace/overview): Workspace configuration