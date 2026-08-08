> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# MastraStorageExporter

Persists traces to Mastra's configured storage with automatic batching and retry logic.

> **Note:** `MastraStorageExporter` was previously called `DefaultExporter`. The original `DefaultExporter` class is still exported from `@mastra/observability` so existing imports keep working, but it's deprecated and will be removed in a future major version. New code should use `MastraStorageExporter`.

## Constructor

```typescript
new MastraStorageExporter(config?: MastraStorageExporterConfig)
```

## `MastraStorageExporterConfig`

```typescript
interface MastraStorageExporterConfig extends BaseExporterConfig {
  /** Maximum number of spans per batch. Default: 1000 */
  maxBatchSize?: number

  /** Maximum total buffer size before emergency flush. Default: 10000 */
  maxBufferSize?: number

  /** Maximum time to wait before flushing batch in milliseconds. Default: 5000 */
  maxBatchWaitMs?: number

  /** Maximum number of retry attempts. Default: 4 */
  maxRetries?: number

  /** Base retry delay in milliseconds (uses exponential backoff). Default: 500 */
  retryDelayMs?: number

  /** Tracing storage strategy or 'auto' for automatic selection. Default: 'auto' */
  strategy?: TracingStorageStrategy | 'auto'
}
```

Extends `BaseExporterConfig`, which includes:

- `logger?: IMastraLogger` - Logger instance
- `logLevel?: LogLevel | 'debug' | 'info' | 'warn' | 'error'` - Log level (default: INFO)

## `TracingStorageStrategy`

```typescript
type TracingStorageStrategy = 'realtime' | 'batch-with-updates' | 'insert-only'
```

### Strategy Behaviors

- **realtime**: Immediately persists each event to storage
- **batch-with-updates**: Batches creates and updates separately, applies in order
- **insert-only**: Only processes SPAN\_ENDED events, ignores updates

## Properties

```typescript
readonly name = 'mastra-storage-exporter';
```

The deprecated `DefaultExporter` class continues to use `'mastra-default-observability-exporter'` as its `name` for backward compatibility.

## Methods

### init

```typescript
init(options: InitExporterOptions): void
```

Initializes the exporter after dependencies are ready. Resolves tracing strategy based on storage capabilities.

### `exportTracingEvent`

```typescript
async exportTracingEvent(event: TracingEvent): Promise<void>
```

Processes a tracing event according to the resolved strategy.

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any buffered events to storage without shutting down the exporter. Useful in serverless environments where you need to ensure spans are exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Flushes remaining buffered events and performs cleanup.

## Automatic strategy selection

When `strategy: 'auto'` (default), the exporter queries the storage adapter for its capabilities:

```typescript
interface TracingStrategy {
  /** Strategies supported by this adapter */
  supported: TracingStorageStrategy[]

  /** Preferred strategy for optimal performance */
  preferred: TracingStorageStrategy
}
```

The exporter will:

1. Use the storage adapter's preferred strategy if available
2. Fall back to the first supported strategy if preferred isn't available
3. Log a warning if a user-specified strategy isn't supported

## Batching behavior

### Flush Triggers

The buffer flushes when any of these conditions are met:

- Buffer size reaches `maxBatchSize`
- Time since first buffered event exceeds `maxBatchWaitMs`
- Buffer size reaches `maxBufferSize` (emergency flush)
- `shutdown()` is called

### Retry Logic

Failed flushes are retried with exponential backoff:

- Retry delay: `retryDelayMs * 2^attempt`
- Maximum attempts: `maxRetries`
- Batch is dropped after all retries fail

### Out-of-Order Handling

For `batch-with-updates` strategy:

- Tracks which spans have been created
- Rejects updates/ends for spans not yet created
- Logs warnings for out-of-order events
- Maintains sequence numbers for ordered updates

## Usage

```typescript
import { MastraStorageExporter } from '@mastra/observability'

// Default configuration
const exporter = new MastraStorageExporter()

// Custom batching configuration
const customExporter = new MastraStorageExporter({
  maxBatchSize: 500,
  maxBatchWaitMs: 2000,
  strategy: 'batch-with-updates',
  logLevel: 'debug',
})
```

## Migrating from `DefaultExporter`

Both classes share the same constructor signature and behavior. To migrate, replace the import and constructor:

```typescript
// Before
import { DefaultExporter } from '@mastra/observability'
const exporter = new DefaultExporter()

// After
import { MastraStorageExporter } from '@mastra/observability'
const exporter = new MastraStorageExporter()
```

The original `DefaultExporter` is preserved unchanged so dashboards or alert rules that match the previous `mastra-default-observability-exporter` exporter name keep working until you migrate.

## See also

### Documentation

- [Tracing Overview](https://mastra.ai/docs/observability/tracing/overview): Complete guide
- [Exporters](https://mastra.ai/docs/observability/integrations/overview): Exporter concepts

### Other Exporters

- [MastraPlatformExporter](https://mastra.ai/reference/observability/tracing/exporters/mastra-platform-exporter): Mastra platform
- [ConsoleExporter](https://mastra.ai/reference/observability/tracing/exporters/console-exporter): Debug output
- [Langfuse](https://mastra.ai/reference/observability/tracing/exporters/langfuse): Langfuse integration
- [Braintrust](https://mastra.ai/reference/observability/tracing/exporters/braintrust): Braintrust integration

### Reference

- [Configuration](https://mastra.ai/reference/observability/tracing/configuration): Configuration options
- [Interfaces](https://mastra.ai/reference/observability/tracing/interfaces): Type definitions