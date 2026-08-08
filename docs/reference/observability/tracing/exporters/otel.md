> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# OtelExporter

Sends traces and logs to any OpenTelemetry-compatible observability platform. Traces use the standardized GenAI semantic conventions; logs carry their original severity and message body and are correlated to traces via both the OTEL log record's native trace context and `mastra.traceId` / `mastra.spanId` attributes.

## Constructor

```typescript
new OtelExporter(config: OtelExporterConfig)
```

## `OtelExporterConfig`

```typescript
interface OtelExporterConfig {
  provider?: ProviderConfig
  signals?: {
    traces?: boolean
    logs?: boolean
  }
  timeout?: number
  batchSize?: number
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}
```

## Provider configurations

### `Dash0Config`

```typescript
interface Dash0Config {
  apiKey?: string
  endpoint?: string
  dataset?: string
}
```

### `SignozConfig`

```typescript
interface SignozConfig {
  apiKey?: string
  region?: 'us' | 'eu' | 'in'
  endpoint?: string
}
```

### `NewRelicConfig`

```typescript
interface NewRelicConfig {
  apiKey?: string
  endpoint?: string
}
```

### `TraceloopConfig`

```typescript
interface TraceloopConfig {
  apiKey?: string
  destinationId?: string
  endpoint?: string
}
```

### `LaminarConfig`

```typescript
interface LaminarConfig {
  apiKey?: string
  endpoint?: string
}
```

### `CustomConfig`

```typescript
interface CustomConfig {
  endpoint: string
  protocol?: 'http/json' | 'http/protobuf' | 'grpc' | 'zipkin'
  headers?: Record<string, string>
}
```

## Methods

### `exportTracingEvent`

```typescript
async exportTracingEvent(event: TracingEvent): Promise<void>
```

Exports a tracing event to the configured OTEL backend.

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any buffered spans to the OTEL backend without shutting down the exporter. Useful in serverless environments where you need to ensure spans are exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Flushes pending traces and shuts down the exporter.

## Usage examples

### Zero-Config (using environment variables)

```typescript
import { OtelExporter } from '@mastra/otel-exporter'

// Set SIGNOZ_API_KEY, SIGNOZ_REGION environment variables
const exporter = new OtelExporter({ provider: { signoz: {} } })

// Or for other providers:
// Set DASH0_API_KEY, DASH0_ENDPOINT for Dash0
// Set NEW_RELIC_LICENSE_KEY for New Relic
// Set TRACELOOP_API_KEY for Traceloop
// Set LMNR_PROJECT_API_KEY for Laminar
```

### Explicit Configuration

```typescript
import { OtelExporter } from '@mastra/otel-exporter'

const exporter = new OtelExporter({
  provider: {
    signoz: {
      apiKey: process.env.SIGNOZ_API_KEY,
      region: 'us',
    },
  },
})
```

### With Custom Endpoint

```typescript
const exporter = new OtelExporter({
  provider: {
    custom: {
      endpoint: 'https://my-collector.example.com/v1/traces',
      protocol: 'http/protobuf',
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    },
  },
  timeout: 60000,
  logLevel: 'debug',
})
```

## Protocol requirements

Different providers require different OTEL exporter packages. Trace and log export are independent: install only the trace package if you only need traces, or install both the trace and log packages for the chosen protocol if you also want log export. Zipkin doesn't support OTLP logs.

| Protocol      | Trace package                                                 | Log package                                                  |
| ------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| gRPC          | `@opentelemetry/exporter-trace-otlp-grpc` (+ `@grpc/grpc-js`) | `@opentelemetry/exporter-logs-otlp-grpc` (+ `@grpc/grpc-js`) |
| HTTP/Protobuf | `@opentelemetry/exporter-trace-otlp-proto`                    | `@opentelemetry/exporter-logs-otlp-proto`                    |
| HTTP/JSON     | `@opentelemetry/exporter-trace-otlp-http`                     | `@opentelemetry/exporter-logs-otlp-http`                     |
| Zipkin        | `@opentelemetry/exporter-zipkin`                              | not supported                                                |

## Tags support

The OtelExporter supports trace tagging for categorization and filtering. Tags are only applied to root spans and are stored as the `mastra.tags` attribute.

### Usage

```typescript
const result = await agent.generate('Hello', {
  tracingOptions: {
    tags: ['production', 'experiment-v2', 'user-request'],
  },
})
```

### How Tags Are Stored

Tags are stored as a JSON-stringified array in the `mastra.tags` span attribute for maximum backend compatibility:

```json
{
  "mastra.tags": "[\"production\",\"experiment-v2\",\"user-request\"]"
}
```

> **Note:** While the OpenTelemetry specification supports native array attributes, many backends (Jaeger, Zipkin, Tempo) have limited array support. JSON strings ensure consistent behavior across all observability platforms.

## Related

- [OtelExporter Guide](https://mastra.ai/docs/observability/integrations/exporters/otel): Setup guide with provider configurations
- [OtelBridge](https://mastra.ai/docs/observability/integrations/bridges/otel): For bidirectional OTEL context integration
- [Tracing Overview](https://mastra.ai/docs/observability/tracing/overview): General tracing concepts