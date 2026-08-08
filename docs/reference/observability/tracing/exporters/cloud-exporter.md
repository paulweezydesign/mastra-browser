> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# CloudExporter

**Added in:** `@mastra/observability@1.8.0`. **Deprecated in `1.12.0`** in favor of [`MastraPlatformExporter`](https://mastra.ai/reference/observability/tracing/exporters/mastra-platform-exporter).

> **Deprecated:** `CloudExporter` is retained for backward compatibility and will be removed in a future major version. Use [`MastraPlatformExporter`](https://mastra.ai/reference/observability/tracing/exporters/mastra-platform-exporter) for new projects. Both classes share the same constructor, environment variables, and runtime behavior; `CloudExporter` keeps its original `mastra-cloud-observability-exporter` exporter `name` and `CLOUD_EXPORTER_*` error IDs so monitoring rules built against it keep working.

Sends tracing spans, logs, metrics, scores, and feedback to the Mastra platform for online visualization and monitoring.

## Constructor

```typescript
new CloudExporter(config?: CloudExporterConfig)
```

## `CloudExporterConfig`

```typescript
interface CloudExporterConfig extends BaseExporterConfig {
  /** Maximum number of spans per batch. Default: 1000 */
  maxBatchSize?: number

  /** Maximum wait time before flushing in milliseconds. Default: 5000 */
  maxBatchWaitMs?: number

  /** Maximum retry attempts. Default: 3 */
  maxRetries?: number

  /** Cloud access token (from env or config) */
  accessToken?: string

  /** Project ID for project-scoped collector routes (letters, numbers, hyphens, underscores) */
  projectId?: string

  /** Base cloud observability endpoint */
  endpoint?: string

  /** Explicit cloud traces endpoint override */
  tracesEndpoint?: string

  /** Explicit cloud logs endpoint override */
  logsEndpoint?: string

  /** Explicit cloud metrics endpoint override */
  metricsEndpoint?: string

  /** Explicit cloud scores endpoint override */
  scoresEndpoint?: string

  /** Explicit cloud feedback endpoint override */
  feedbackEndpoint?: string
}
```

Extends `BaseExporterConfig`, which includes:

- `logger?: IMastraLogger` - Logger instance
- `logLevel?: LogLevel | 'debug' | 'info' | 'warn' | 'error'` - Log level (default: INFO)

## Environment variables

The exporter reads these environment variables if not provided in config:

- `MASTRA_PLATFORM_ACCESS_TOKEN` - Authentication token for `CloudExporter` requests
- `MASTRA_PROJECT_ID` - Project ID to use when deriving project-scoped collector routes such as `/projects/:projectId/ai/spans/publish`
- `MASTRA_PLATFORM_OBSERVABILITY_ENDPOINT` - Observability endpoint override. Pass either a base origin or a full traces publish URL. Defaults to `https://observability.mastra.ai` in `@mastra/observability@1.9.2` and later

## Properties

```typescript
readonly name = 'mastra-cloud-observability-exporter';
```

## Methods

### `exportTracingEvent`

```typescript
async exportTracingEvent(event: TracingEvent): Promise<void>
```

Processes tracing events for Cloud export.

Only `SPAN_ENDED` tracing events are exported. `SPAN_STARTED` and `SPAN_UPDATED` are ignored. Matching spans are buffered and uploaded to the Cloud traces endpoint on the next flush.

**Returns:** `Promise<void>` after the tracing event has been accepted for buffering or ignored.

### `onLogEvent`

```typescript
async onLogEvent(event: LogEvent): Promise<void>
```

Processes log signals for Cloud export.

Every `LogEvent` passed to this handler is buffered and exported to the Cloud logs endpoint derived from the configured base endpoint. Unlike tracing, there is no additional event-status filtering at the `CloudExporter` level. If the exporter is disabled, this method becomes a no-op.

**Returns:** `Promise<void>` after the log event has been accepted for buffering.

### `onMetricEvent`

```typescript
async onMetricEvent(event: MetricEvent): Promise<void>
```

Processes metric signals for Cloud export.

Every `MetricEvent` passed to this handler is buffered and exported to the Cloud metrics endpoint derived from the configured base endpoint. Additional filtering by metric subtype or status inside `CloudExporter` isn't performed. The exporter forwards every metric event it receives unless it's disabled.

**Returns:** `Promise<void>` after the metric event has been accepted for buffering.

### `onScoreEvent`

```typescript
async onScoreEvent(event: ScoreEvent): Promise<void>
```

Processes score signals for Cloud export.

Every `ScoreEvent` passed to this handler is buffered and exported to the Cloud scores endpoint derived from the configured base endpoint. No extra filtering at the exporter layer beyond the disabled-exporter check is performed, so all score events received by this method are forwarded.

**Returns:** `Promise<void>` after the score event has been accepted for buffering.

### `onFeedbackEvent`

```typescript
async onFeedbackEvent(event: FeedbackEvent): Promise<void>
```

Processes feedback signals for Cloud export.

Every `FeedbackEvent` passed to this handler is buffered and exported to the Cloud feedback endpoint derived from the configured base endpoint. No feedback-type filtering inside `CloudExporter` is performed. All feedback events received here are forwarded unless the exporter is disabled.

**Returns:** `Promise<void>` after the feedback event has been accepted for buffering.

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any buffered events to the Mastra platform without shutting down the exporter. Useful in serverless environments where you need to ensure spans are exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Flushes remaining events and performs cleanup.

## Behavior

### Authentication

If no access token is provided via config or environment variable, the exporter:

- Logs a warning with sign-up information
- Operates as a no-op (discards all events)

### Batching

The exporter batches tracing spans, logs, metrics, scores, and feedback for efficient network usage:

- Flushes when total buffered event count reaches `maxBatchSize`
- Flushes when `maxBatchWaitMs` elapsed since the first buffered signal in the batch
- Flushes on `shutdown()`

### Error handling

- Uses exponential backoff retry with `maxRetries` attempts
- Drops batches after all retries fail
- Logs errors but continues processing new events

### Endpoint routing

- Base origins derive signal endpoints automatically
- Without `projectId`, derived routes use `/ai/{signal}/publish`
- With `projectId` or `MASTRA_PROJECT_ID`, derived routes use `/projects/:projectId/ai/{signal}/publish`
- Explicit full publish URLs are used as-is, even when `projectId` is configured

### Signal Processing

- `exportTracingEvent()` only exports `SPAN_ENDED` tracing events
- `onLogEvent()`, `onMetricEvent()`, `onScoreEvent()`, and `onFeedbackEvent()` buffer every event they receive for their respective signal type
- All supported signal batches are uploaded to their matching Cloud publish endpoints during `flush()` and `shutdown()`

## `MastraCloudSpanRecord`

Internal format for cloud spans:

```typescript
interface MastraCloudSpanRecord {
  traceId: string
  spanId: string
  parentSpanId: string | null
  name: string
  spanType: string
  attributes: Record<string, any> | null
  metadata: Record<string, any> | null
  startedAt: Date
  endedAt: Date | null
  input: any
  output: any
  error: any
  isEvent: boolean
  createdAt: Date
  updatedAt: Date | null
}
```

## Usage

```typescript
import { CloudExporter } from '@mastra/observability'

// Uses environment variable for token
const exporter = new CloudExporter()

// Explicit configuration
const customExporter = new CloudExporter({
  accessToken: 'your-token',
  projectId: 'project_123',
  maxBatchSize: 500,
  maxBatchWaitMs: 2000,
  logLevel: 'debug',
})
```

## See also

### Documentation

- [Tracing Overview](https://mastra.ai/docs/observability/tracing/overview): Complete guide
- [Exporters](https://mastra.ai/docs/observability/integrations/overview): Exporter concepts

### Other Exporters

- [DefaultExporter](https://mastra.ai/reference/observability/tracing/exporters/default-exporter): Storage persistence
- [ConsoleExporter](https://mastra.ai/reference/observability/tracing/exporters/console-exporter): Debug output
- [Langfuse](https://mastra.ai/reference/observability/tracing/exporters/langfuse): Langfuse integration
- [Braintrust](https://mastra.ai/reference/observability/tracing/exporters/braintrust): Braintrust integration

### Reference

- [Configuration](https://mastra.ai/reference/observability/tracing/configuration): Configuration options
- [Interfaces](https://mastra.ai/reference/observability/tracing/interfaces): Type definitions