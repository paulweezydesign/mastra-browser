> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# OpenAI Responses API

This OpenAI-compatible, agent-backed interface lets you use Mastra Agents as a Responses API. It provides methods to create, retrieve, stream, and delete responses through Mastra agents.

These routes are agent-backed adapters over Mastra agents, memory, and storage. Use `agent_id` to select the Mastra agent that should handle the request. You can pass `model` to override the agent's configured model for a single request, or omit it to use the model already configured on the agent.

Stored responses also return `conversation_id`. In Mastra, this is the raw memory `threadId`.

This API is currently experimental.

## Usage example

```typescript
import { MastraClient } from '@mastra/client-js'

const client = new MastraClient({
  baseUrl: 'http://localhost:4111',
})

const response = await client.responses.create({
  agent_id: 'support-agent',
  input: 'Summarize this ticket',
  store: true,
})

console.log(response.output_text)
```

## Methods

### Lifecycle

#### `create(params)`

Creates a response.

```typescript
const response = await client.responses.create({
  agent_id: 'support-agent',
  input: 'Summarize this ticket',
})
```

**Returns:** `Promise<ResponsesResponse>` when `stream` is omitted or `false`.

When `stream: true`, `create()` returns an async iterable of SSE-style event payloads:

```typescript
const stream = await client.responses.create({
  agent_id: 'support-agent',
  input: 'Summarize this ticket',
  stream: true,
})

for await (const event of stream) {
  if (event.type === 'response.output_text.delta') {
    process.stdout.write(event.delta)
  }
}
```

Streaming responses can also include tool events. Tool-call streams use `response.output_item.added`, `response.function_call_arguments.delta`, `response.function_call_arguments.done`, and `response.output_item.done` events. Tool results appear as `function_call_output` items with `<toolCallId>:output` IDs.

**Returns:** `Promise<ResponsesStream>`.

#### `retrieve(responseId, requestContext?)`

Retrieves a stored response.

```typescript
const response = await client.responses.retrieve('msg_123')
```

**Returns:** `Promise<ResponsesResponse>`.

#### `delete(responseId, requestContext?)`

Deletes a stored response.

```typescript
const deleted = await client.responses.delete('msg_123')
```

**Returns:** `Promise<{ id: string; object: "response"; deleted: true }>`

#### `stream(params)`

Creates a streaming response.

```typescript
const stream = await client.responses.stream({
  agent_id: 'support-agent',
  input: 'Say hello',
})

for await (const event of stream) {
  console.log(event.type)
}
```

**Returns:** `Promise<ResponsesStream>`.

## Stored responses and conversations

Stored responses include both `response.id` and `conversation_id`.

- `response.id` is the response ID. For stored agent-backed responses, this is the persisted assistant message ID.
- `conversation_id` is the raw Mastra thread ID.

Use `previous_response_id` when you want to continue from a previous stored response. Use `conversation_id` when you want to target a known thread directly.

```typescript
const first = await client.responses.create({
  agent_id: 'support-agent',
  input: 'Start a support thread',
  store: true,
})

const second = await client.responses.create({
  agent_id: 'support-agent',
  conversation_id: first.conversation_id!,
  input: 'Add a follow-up to the same thread',
  store: true,
})
```

Use [`client.conversations`](https://mastra.ai/reference/client-js/conversations) when you want to create, retrieve, delete, or inspect the underlying OpenAI Responses API conversation directly.

## Function calling (tools)

`response.tools` contains the configured function definitions available for the request.

If the model calls a function, that activity is included in `response.output` as `function_call` and `function_call_output` items alongside the final assistant `message`.

When `stream: true`, function calls are also emitted as Responses stream events. Read `response.function_call_arguments.delta` events for partial argument chunks and prefer `response.function_call_arguments.done` for the finalized arguments payload and tool name. Read `response.output_item.done` events for completed `function_call` and `function_call_output` items. Tool output items use `<toolCallId>:output` IDs.

## Structured output

Use `text.format` when you want JSON output.

- `json_object` enables JSON mode.
- `json_schema` enables schema-constrained structured output.

Both formats return JSON in the assistant message content. Use `json_schema` when you need strict schema enforcement. Use `json_object` when you only need valid JSON output.

```typescript
const response = await client.responses.create({
  agent_id: 'support-agent',
  input: 'Return a structured support ticket summary.',
  text: {
    format: {
      type: 'json_schema',
      name: 'ticket_summary',
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          priority: { type: 'string' },
        },
        required: ['summary', 'priority'],
        additionalProperties: false,
      },
    },
  },
})
```

## Provider-backed requests

Use `providerOptions` when you need provider-specific options that Mastra doesn't normalize at the Responses layer.

```typescript
const response = await client.responses.create({
  agent_id: 'support-agent',
  input: 'Continue this exchange',
  providerOptions: {
    openai: {
      previousResponseId: 'resp_123',
    },
  },
})
```

## Response shape

The returned response object includes:

- `id`: The response ID
- `output`: Output items such as the assistant `message`, `function_call`, and `function_call_output`
- `output_text`: Convenience getter that joins assistant text output
- `tools`: Configured tool definitions for the request
- `conversation_id`: The raw thread ID for stored responses
- `text`: The requested text output format, when provided

## Parameters

**agent\_id** (`string`): Required on initial requests. Selects the Mastra agent that executes the request. Stored follow-up turns can omit it when continuing with previous\_response\_id.

**model** (`string`): Optional model override for this request, such as openai/gpt-5. If omitted, Mastra uses the model configured on the selected agent.

**input** (`string | Array<{ role: 'system' | 'developer' | 'user' | 'assistant'; content: string | Array<{ type: 'input_text' | 'text' | 'output_text'; text: string }> }>`): Required. Input text or message array for the response.

**instructions** (`string`): Optional instruction override for this request.

**text** (`{ format: { type: 'json_object' } | { type: 'json_schema'; name: string; schema: Record<string, unknown>; description?: string; strict?: boolean } }`): Optional text output format. Use json\_object for JSON mode or json\_schema for schema-constrained structured output.

**providerOptions** (`Record<string, Record<string, unknown> | undefined>`): Optional provider-specific options passed through to the underlying model call.

**stream** (`boolean`): When true, returns an async iterable of Responses API events.

**store** (`boolean`): When true, persists the response through the selected agent memory.

**conversation\_id** (`string`): Optional conversation identifier. In Mastra, this is the raw memory thread ID.

**previous\_response\_id** (`string`): Continues a stored response chain from a previous stored response.

**requestContext** (`RequestContext | Record<string, any>`): Optional request context forwarded to the Mastra server.