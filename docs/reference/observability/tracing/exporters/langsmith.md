> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# LangSmithExporter

Sends Tracing data to LangSmith for observability.

## Constructor

```typescript
new LangSmithExporter(config: LangSmithExporterConfig)
```

## `LangSmithExporterConfig`

```typescript
interface LangSmithExporterConfig extends ClientConfig, BaseExporterConfig {
  client?: Client
  projectName?: string
}
```

Extends both `ClientConfig` (from LangSmith SDK) and `BaseExporterConfig`:

- From `BaseExporterConfig`: `logger?: IMastraLogger`, `logLevel?: LogLevel | 'debug' | 'info' | 'warn' | 'error'`
- From `ClientConfig`: `apiKey`, `apiUrl`, `callerOptions`, `hideInputs`, `hideOutputs`, etc.

## Methods

### `exportTracingEvent`

```typescript
async exportTracingEvent(event: TracingEvent): Promise<void>
```

Exports a tracing event to LangSmith.

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any pending spans to LangSmith without shutting down the exporter. Useful in serverless environments where you need to ensure spans are exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Ends all active spans and clears the trace map.

## Usage

```typescript
import { LangSmithExporter } from '@mastra/langsmith'

const exporter = new LangSmithExporter({
  apiKey: process.env.LANGSMITH_API_KEY,
  projectName: 'my-project', // Optional: specify which project to send traces to
  apiUrl: 'https://api.smith.langchain.com',
  logLevel: 'info',
})
```

## Environment variables

| Variable             | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `LANGSMITH_API_KEY`  | Your LangSmith API key                                                |
| `LANGCHAIN_PROJECT`  | Default project name for traces (used if `projectName` not specified) |
| `LANGSMITH_BASE_URL` | API URL for self-hosted instances                                     |

## Span type mapping

| Span Type            | LangSmith Type |
| -------------------- | -------------- |
| `MODEL_GENERATION`   | `llm`          |
| `MODEL_CHUNK`        | `llm`          |
| `TOOL_CALL`          | `tool`         |
| `MCP_TOOL_CALL`      | `tool`         |
| `PROVIDER_TOOL_CALL` | `tool`         |
| All others           | `chain`        |

## `withLangsmithMetadata`

Helper function to add LangSmith-specific metadata to tracing options.

```typescript
function withLangsmithMetadata(metadata: LangSmithMetadataInput): TracingOptionsUpdater
```

### `LangSmithMetadataInput`

### Usage

```typescript
import { buildTracingOptions } from '@mastra/observability'
import { withLangsmithMetadata } from '@mastra/langsmith'

// Route to a specific project
const tracingOptions = buildTracingOptions(withLangsmithMetadata({ projectName: 'my-project' }))

// Set multiple fields
const tracingOptions = buildTracingOptions(
  withLangsmithMetadata({
    projectName: 'my-project',
    sessionId: 'user-123',
  }),
)
```