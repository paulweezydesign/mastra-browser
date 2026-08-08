> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# ArizeExporter

Sends Tracing data to Arize Phoenix, Arize AX, or any OpenTelemetry-compatible observability platform that supports OpenInference semantic conventions.

## Constructor

```typescript
new ArizeExporter(config: ArizeExporterConfig)
```

## `ArizeExporterConfig`

```typescript
type ArizeExporterConfig = Omit<OtelExporterConfig, 'provider'> & {
  // Phoenix / OpenTelemetry configuration
  endpoint?: string
  apiKey?: string

  // Arize AX configuration
  spaceId?: string

  // Common configuration
  projectName?: string
  headers?: Record<string, string>
}
```

Inherits from `OtelExporterConfig` (excluding `provider`), which includes:

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
import { ArizeExporter } from '@mastra/arize'

// For Phoenix: Set PHOENIX_COLLECTOR_ENDPOINT, PHOENIX_API_KEY, PHOENIX_PROJECT_NAME
// For Arize AX: Set ARIZE_SPACE_ID, ARIZE_API_KEY, ARIZE_PROJECT_NAME
const exporter = new ArizeExporter()
```

### Phoenix Configuration

```typescript
import { ArizeExporter } from '@mastra/arize'

const exporter = new ArizeExporter({
  endpoint: 'http://localhost:6006/v1/traces',
  apiKey: process.env.PHOENIX_API_KEY, // Optional for local Phoenix
  projectName: 'my-ai-project',
})
```

### Arize AX Configuration

```typescript
import { ArizeExporter } from '@mastra/arize'

const exporter = new ArizeExporter({
  spaceId: process.env.ARIZE_SPACE_ID!,
  apiKey: process.env.ARIZE_API_KEY!,
  projectName: 'my-ai-project',
})
```

## `OpenInference` semantic conventions

The ArizeExporter implements [OpenInference Semantic Conventions](https://github.com/Arize-ai/openinference/tree/main/spec) for generative AI applications, providing standardized trace structure across different observability platforms.

## Tags support

The ArizeExporter supports trace tagging for categorization and filtering. Tags are only applied to root spans and are mapped to the native OpenInference `tag.tags` semantic convention.

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

- [ArizeExporter Documentation](https://mastra.ai/docs/observability/integrations/exporters/arize)
- [Phoenix Documentation](https://docs.arize.com/phoenix)
- [Arize AX Documentation](https://docs.arize.com/)