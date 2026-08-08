> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# LaminarExporter

Sends Tracing data to Laminar via OTLP/HTTP (protobuf).

## Constructor

```typescript
new LaminarExporter(config?: LaminarExporterConfig)
```

## `LaminarExporterConfig`

```typescript
interface LaminarExporterConfig extends BaseExporterConfig {
  apiKey?: string
  baseUrl?: string
  endpoint?: string
  headers?: Record<string, string>
  realtime?: boolean
  disableBatch?: boolean
  batchSize?: number
  timeoutMillis?: number
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

Exports a tracing event to Laminar.

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any buffered spans to Laminar without shutting down the exporter. Useful in serverless environments where you need to ensure spans are exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Flushes pending data and shuts down the exporter.

## Usage

### Zero-Config (using environment variables)

```typescript
import { LaminarExporter } from '@mastra/laminar'

// Reads from LMNR_PROJECT_API_KEY, LMNR_BASE_URL, LAMINAR_ENDPOINT
const exporter = new LaminarExporter()
```

### Explicit Configuration

```typescript
import { LaminarExporter } from '@mastra/laminar'

const exporter = new LaminarExporter({
  apiKey: process.env.LMNR_PROJECT_API_KEY,
  baseUrl: 'https://api.lmnr.ai',
  realtime: true,
})
```