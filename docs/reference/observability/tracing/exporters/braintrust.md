> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# BraintrustExporter

Sends Tracing data to Braintrust for eval and observability.

## Constructor

```typescript
new BraintrustExporter(config: BraintrustExporterConfig)
```

## `BraintrustExporterConfig`

```typescript
interface BraintrustExporterConfig extends BaseExporterConfig {
  apiKey?: string
  endpoint?: string
  projectName?: string
  braintrustLogger?: Logger<true>
  currentSpan?: () => Span | undefined
  tuningParameters?: Record<string, any>
}
```

Extends `BaseExporterConfig`, which includes:

- `logger?: IMastraLogger` - Logger instance
- `logLevel?: LogLevel | 'debug' | 'info' | 'warn' | 'error'` - Log level (default: INFO)

## Methods

### `exportTracingEvent`

```typescript
async exportTracingEvent(event: TracingEvent): Promise<void>
```

Exports a tracing event to Braintrust.

### export

```typescript
async export(spans: ReadOnlySpan[]): Promise<void>
```

Batch exports spans to Braintrust.

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any buffered spans to Braintrust without shutting down the exporter. Useful in serverless environments where you need to ensure spans are exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Flushes pending data and shuts down the client.

## Usage

### Zero-Config (using environment variables)

```typescript
import { BraintrustExporter } from '@mastra/braintrust'

// Reads from BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT
const exporter = new BraintrustExporter()
```

### Explicit Configuration

```typescript
import { BraintrustExporter } from '@mastra/braintrust'

const exporter = new BraintrustExporter({
  apiKey: process.env.BRAINTRUST_API_KEY,
  projectName: 'my-ai-project',
})
```

## Span type mapping

| Span Type                   | Braintrust Type |
| --------------------------- | --------------- |
| `MODEL_GENERATION`          | `llm`           |
| `MODEL_CHUNK`               | `llm`           |
| `TOOL_CALL`                 | `tool`          |
| `MCP_TOOL_CALL`             | `tool`          |
| `PROVIDER_TOOL_CALL`        | `tool`          |
| `WORKFLOW_CONDITIONAL_EVAL` | `function`      |
| `WORKFLOW_WAIT_EVENT`       | `function`      |
| All others                  | `task`          |