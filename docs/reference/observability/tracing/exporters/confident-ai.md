> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# DeepEvalExporter

Sends Tracing data to [Confident AI](https://www.confident-ai.com/) for evaluation and observability. Exported by `@mastra/deepeval`, which builds on the DeepEval SDK.

See [Confident AI exporter](https://mastra.ai/docs/observability/integrations/exporters/confident-ai) for setup and usage.

## Constructor

```typescript
new DeepEvalExporter(config?: DeepEvalExporterConfig)
```

## `DeepEvalExporterConfig`

```typescript
interface DeepEvalExporterConfig extends BaseExporterConfig {
  apiKey?: string
  environment?: string
  name?: string
  tags?: string[]
  metadata?: Record<string, any>
  threadId?: string
  userId?: string
  testCaseId?: string
  turnId?: string
  metricCollection?: string
  traceMetricCollection?: string
  llmMetricCollection?: string
  agentMetricCollection?: string
  toolMetricCollectionMap?: Record<string, string>
  prompt?: Prompt
  debug?: boolean
  traceCaptureSink?: (trace: Trace) => void
}
```

Extends `BaseExporterConfig`, which includes:

- `logger?: IMastraLogger` - Logger instance
- `logLevel?: LogLevel | 'debug' | 'info' | 'warn' | 'error'` - Log level (default: INFO)

**apiKey** (`string`): Confident AI API key. Falls back to the CONFIDENT\_API\_KEY env var. The exporter disables itself when no key is found.

**environment** (`string`): Trace environment. Falls back to CONFIDENT\_TRACE\_ENVIRONMENT, then 'development'.

**name** (`string`): Trace name applied to every trace. Defaults to the Mastra serviceName.

**tags** (`string[]`): Tags applied to every trace.

**metadata** (`Record<string, any>`): Metadata applied to every trace.

**threadId** (`string`): Thread ID applied to every trace. A threadId in the root span metadata overrides it per request.

**userId** (`string`): User ID applied to every trace. A userId in the root span metadata overrides it per request.

**testCaseId** (`string`): Test case ID applied to every trace. A testCaseId in the root span metadata overrides it per request.

**turnId** (`string`): Turn ID applied to every trace. A turnId in the root span metadata overrides it per request.

**metricCollection** (`string`): Trace-level metric collection.

**traceMetricCollection** (`string`): Trace-level metric collection. Takes precedence over metricCollection.

**llmMetricCollection** (`string`): Metric collection applied to LLM spans.

**agentMetricCollection** (`string`): Metric collection applied to agent spans.

**toolMetricCollectionMap** (`Record<string, string>`): Metric collection applied per tool name.

**prompt** (`Prompt`): Confident AI managed prompt linkage attached to LLM spans.

**debug** (`boolean`): Logs exporter configuration and export errors to the console.

**traceCaptureSink** (`(trace: Trace) => void`): Receives completed traces locally instead of posting them to Confident AI. Use for offline evaluation.

**logLevel** (`'debug' | 'info' | 'warn' | 'error'`): Logger level (default: 'info')

## Methods

### `exportTracingEvent`

```typescript
async exportTracingEvent(event: TracingEvent): Promise<void>
```

Exports a tracing event to Confident AI. Builds the trace tree from the Mastra span stream and posts the trace when the root span ends.

### `flush`

```typescript
async flush(): Promise<void>
```

Waits for any in-flight trace posts to settle without shutting down the exporter.

### `shutdown`

```typescript
async shutdown(): Promise<void>
```

Finalizes any open traces and flushes pending posts.

## Usage

### Zero-Config (using environment variables)

```typescript
import { DeepEvalExporter } from '@mastra/deepeval'

// Reads from CONFIDENT_API_KEY, CONFIDENT_TRACE_ENVIRONMENT
const exporter = new DeepEvalExporter()
```

### Explicit Configuration

```typescript
import { DeepEvalExporter } from '@mastra/deepeval'

const exporter = new DeepEvalExporter({
  apiKey: process.env.CONFIDENT_API_KEY,
  environment: 'production',
})
```

## Span type mapping

| Mastra span type                                                       | Confident AI span type |
| ---------------------------------------------------------------------- | ---------------------- |
| `AGENT_RUN`, `WORKFLOW_RUN`                                            | `AGENT`                |
| `MODEL_GENERATION`                                                     | `LLM`                  |
| `TOOL_CALL`, `MCP_TOOL_CALL`, `PROVIDER_TOOL_CALL`, `CLIENT_TOOL_CALL` | `TOOL`                 |
| `RAG_EMBEDDING`, `RAG_VECTOR_OPERATION`                                | `RETRIEVER`            |
| All other exported span types                                          | `CUSTOM`               |

Event spans (for example `MODEL_CHUNK`) are dropped.