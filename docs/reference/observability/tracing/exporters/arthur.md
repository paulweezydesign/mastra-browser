> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# ArthurExporter

Sends Tracing data to [Arthur Engine](https://github.com/arthur-ai/arthur-engine) using OpenTelemetry and OpenInference semantic conventions.

## Constructor

```typescript
new ArthurExporter(config: ArthurExporterConfig)
```

## `ArthurExporterConfig`

```typescript
type ArthurExporterConfig = Omit<OtelExporterConfig, 'provider' | 'exporter'> & {
  apiKey?: string
  endpoint?: string
  taskId?: string
  headers?: Record<string, string>
}
```

Inherits from `OtelExporterConfig` (excluding `provider` and `exporter`), which includes:

- `timeout?: number` - Export timeout in milliseconds (default: 30000)
- `batchSize?: number` - Number of spans per batch (default: 512)
- `logLevel?: LogLevel | 'debug' | 'info' | 'warn' | 'error'` - Log level (default: WARN)
- `resourceAttributes?: Record<string, any>` - Custom resource attributes

### Metadata passthrough

Non-reserved span attributes are serialized into the OpenInference `metadata` payload. Add them via `tracingOptions.metadata` (e.g., `companyId`, `tier`). Reserved fields such as `input`, `output`, `sessionId`, thread/user IDs, and OpenInference IDs are excluded automatically.

## Methods

### `exportTracingEvent`

```typescript
async exportTracingEvent(event: TracingEvent): Promise<void>
```

Exports a tracing event to the configured endpoint.

### export

```typescript
async export(spans: ReadOnlySpan[]): Promise<void>
```

Batch exports spans using OpenTelemetry with OpenInference semantic conventions.

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any buffered spans to the configured endpoint without shutting down the exporter. Useful in serverless environments where you need to ensure spans are exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Flushes pending data and shuts down the client.

## Usage

### Zero-Config (using environment variables)

```typescript
import { ArthurExporter } from '@mastra/arthur'

// Set ARTHUR_API_KEY and ARTHUR_BASE_URL (optionally ARTHUR_TASK_ID)
const exporter = new ArthurExporter()
```

### Explicit Configuration

```typescript
import { ArthurExporter } from '@mastra/arthur'

const exporter = new ArthurExporter({
  apiKey: process.env.ARTHUR_API_KEY!,
  endpoint: 'http://localhost:3030',
  taskId: process.env.ARTHUR_TASK_ID, // Optional
})
```

## `OpenInference` semantic conventions

The ArthurExporter implements [OpenInference Semantic Conventions](https://github.com/Arize-ai/openinference/tree/main/spec) for generative AI applications, providing standardized trace structure across different observability platforms.

## Tags support

The ArthurExporter supports trace tagging for categorization and filtering. Tags are only applied to root spans and are mapped to the native OpenInference `tag.tags` semantic convention.

### Usage

```typescript
const result = await agent.generate('Hello', {
  tracingOptions: {
    tags: ['production', 'experiment-v2', 'user-request'],
  },
})
```

### How Tags Are Stored

Tags are stored using the OpenInference `tag.tags` attribute:

```json
{
  "tag.tags": ["production", "experiment-v2", "user-request"]
}
```

## Related

- [ArthurExporter Documentation](https://mastra.ai/docs/observability/integrations/exporters/arthur)
- [Arthur Engine documentation](https://docs.arthur.ai/)
- [Arthur Engine repository](https://github.com/arthur-ai/arthur-engine)