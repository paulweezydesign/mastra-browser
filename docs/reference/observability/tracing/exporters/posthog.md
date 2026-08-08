> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# PosthogExporter

Sends Tracing data to PostHog for AI observability and analytics.

## Constructor

```typescript
new PosthogExporter(config: PosthogExporterConfig)
```

## `PosthogExporterConfig`

```typescript
interface PosthogExporterConfig extends BaseExporterConfig {
  apiKey?: string
  host?: string
  flushAt?: number
  flushInterval?: number
  serverless?: boolean
  defaultDistinctId?: string
  enablePrivacyMode?: boolean
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

Exports a tracing event to PostHog.

### `onFeedbackEvent`

```typescript
async onFeedbackEvent(event: FeedbackEvent): Promise<void>
```

Exports a feedback event to PostHog. See [Feedback export](#feedback-export).

### flush

```typescript
async flush(): Promise<void>
```

Force flushes any buffered events to PostHog without shutting down the exporter. Useful in serverless environments where you need to ensure spans are exported before the runtime terminates.

### shutdown

```typescript
async shutdown(): Promise<void>
```

Flushes pending batched events and shuts down the PostHog client.

## Usage

### Zero-Config (using environment variables)

```typescript
import { PosthogExporter } from '@mastra/posthog'

// Reads from POSTHOG_API_KEY, POSTHOG_HOST
const exporter = new PosthogExporter()
```

### Explicit Configuration

```typescript
import { PosthogExporter } from '@mastra/posthog'

const exporter = new PosthogExporter({
  apiKey: process.env.POSTHOG_API_KEY!,
  host: 'https://us.i.posthog.com',
  serverless: true,
})
```

## Span type mapping

| Mastra Span Type     | PostHog Event Type |
| -------------------- | ------------------ |
| `MODEL_GENERATION`   | `$ai_generation`   |
| `MODEL_STEP`         | `$ai_generation`   |
| `MODEL_CHUNK`        | `$ai_span`         |
| `TOOL_CALL`          | `$ai_span`         |
| `MCP_TOOL_CALL`      | `$ai_span`         |
| `PROVIDER_TOOL_CALL` | `$ai_span`         |
| `PROCESSOR_RUN`      | `$ai_span`         |
| `AGENT_RUN`          | `$ai_span`         |
| `WORKFLOW_RUN`       | `$ai_span`         |
| All other workflows  | `$ai_span`         |
| `GENERIC`            | `$ai_span`         |

## Feedback export

Feedback recorded with [`addFeedback()`](https://mastra.ai/docs/observability/feedback) is exported to PostHog as a native `$ai_feedback` event. PostHog shows it as **User feedback** on the linked trace. No extra configuration is needed.

```typescript
const trace = await mastra.observability.getRecordedTrace({ traceId })
await trace.addFeedback({
  feedbackType: 'thumbs',
  value: 'down',
  comment: 'Wrong answer',
})
```

Feedback events map to these PostHog properties:

| Mastra feedback field                  | PostHog property    |
| -------------------------------------- | ------------------- |
| `traceId`                              | `$ai_trace_id`      |
| `comment` (or `value` when no comment) | `$ai_feedback_text` |
| `feedbackId`                           | `feedback_id`       |
| `feedbackType`                         | `feedback_type`     |
| `value`                                | `feedback_value`    |
| `feedbackSource`                       | `feedback_source`   |
| `spanId`                               | `span_id`           |
| `sourceId`                             | `source_id`         |
| `metadata.sessionId`                   | `$ai_session_id`    |
| `metadata` (other keys)                | custom properties   |

Feedback without a `traceId` is dropped because PostHog anchors feedback to a trace through `$ai_trace_id`. The event's distinct ID resolves from `feedbackUserId`, then `metadata.userId`, then `defaultDistinctId`, then `anonymous`.