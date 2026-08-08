> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# LangfuseExporter

Sends Tracing data to Langfuse for observability.

## Constructor

```typescript
new LangfuseExporter(config: LangfuseExporterConfig)
```

## `LangfuseExporterConfig`

```typescript
interface LangfuseExporterConfig extends BaseExporterConfig {
  publicKey?: string
  secretKey?: string
  baseUrl?: string
  realtime?: boolean
  flushAt?: number
  flushInterval?: number
  environment?: string
  release?: string
}
```

Extends `BaseExporterConfig`, which includes:

- `logger?: IMastraLogger` - Logger instance
- `logLevel?: LogLevel | 'debug' | 'info' | 'warn' | 'error'` - Log level (default: INFO)

## Properties

### `client`

```typescript
get client(): LangfuseClient | undefined
```

The `LangfuseClient` instance for advanced Langfuse features. Returns `undefined` when the exporter is disabled (missing credentials). Use this for prompt management, evaluations, datasets, and direct API access.

## Methods

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any buffered spans and scores to Langfuse without shutting down. Useful in serverless environments where you need to ensure data is exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Flushes pending data and shuts down both the span processor and the client.

## Usage

### Zero-Config (using environment variables)

```typescript
import { LangfuseExporter } from '@mastra/langfuse'

// Reads from LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASE_URL
const exporter = new LangfuseExporter()
```

### Explicit Configuration

```typescript
import { LangfuseExporter } from '@mastra/langfuse'

const exporter = new LangfuseExporter({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: 'https://cloud.langfuse.com',
  realtime: true,
})
```

## Span mapping

Mastra spans are converted to OTel format and sent to Langfuse via `LangfuseSpanProcessor`. Langfuse automatically maps spans based on their `gen_ai.*` attributes:

- Spans with a `model` attribute → Langfuse generations
- All other spans → Langfuse spans
- Parent-child relationships are preserved via OTel trace/span IDs

## Prompt linking

Link LLM generations to [Langfuse Prompt Management](https://langfuse.com/docs/prompt-management) using the `withLangfusePrompt` helper:

```typescript
import { buildTracingOptions } from '@mastra/observability'
import { LangfuseExporter, withLangfusePrompt } from '@mastra/langfuse'

const exporter = new LangfuseExporter()

// Fetch prompt via the Langfuse client
const prompt = await exporter.client.prompt.get('customer-support', { type: 'text' })

const agent = new Agent({
  id: 'support-agent',
  name: 'support-agent',
  instructions: prompt.compile(),
  model: 'openai/gpt-5.6-sol',
  defaultGenerateOptions: {
    tracingOptions: buildTracingOptions(
      withLangfusePrompt({ name: prompt.name, version: prompt.version }),
    ),
  },
})
```

### Helper Functions

#### `withLangfusePrompt(prompt)`

Adds Langfuse prompt metadata to tracing options.

```typescript
// Link by name and version (required for Langfuse v5)
withLangfusePrompt({ name: 'my-prompt', version: 1 })
```

The prompt metadata is passed through as span attributes and Langfuse links the generation to the corresponding prompt.