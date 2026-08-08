> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# handleChatStream()

Framework-agnostic handler for streaming agent chat in AI SDK-compatible format. Use this function directly when you need to handle chat streaming outside Hono or Mastra's own [apiRoutes](https://mastra.ai/docs/server/custom-api-routes) feature.

`handleChatStream()` returns a `ReadableStream` that you can wrap with [`createUIMessageStreamResponse()`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/create-ui-message-stream-response).

`handleChatStream()` keeps the existing AI SDK v5/default behavior. If your app is typed against AI SDK v6, pass `version: 'v6'`.

Use [`chatRoute()`](https://mastra.ai/reference/ai-sdk/chat-route) if you want to create a chat route inside a Mastra server.

## Structured output in UI streams

When you pass `structuredOutput` to the underlying agent execution, the final structured output object is emitted in the AI SDK-compatible UI stream as a custom data part:

```json
{
  "type": "data-structured-output",
  "data": {
    "object": {}
  }
}
```

The `object` field contains your full structured output value. Mastra emits this event for the final structured output object only. Partial structured output chunks aren't exposed in the UI stream.

Read this event with AI SDK UI's custom data handling, such as `onData`, or render it from message data parts.

## Usage example

Next.js App Router example:

```typescript
import { handleChatStream } from '@mastra/ai-sdk'
import { createUIMessageStreamResponse } from 'ai'
import { mastra } from '@/src/mastra'

export async function POST(req: Request) {
  const params = await req.json()
  const stream = await handleChatStream({
    mastra,
    agentId: 'weatherAgent',
    params,
    messageMetadata: () => ({ createdAt: new Date().toISOString() }),
  })
  return createUIMessageStreamResponse({ stream })
}
```

## Parameters

**version** (`'v5' | 'v6'`): Selects the AI SDK stream contract to emit. Omit it or pass 'v5' for the existing default behavior. Pass 'v6' when your app is typed against AI SDK v6 response helpers. (Default: `'v5'`)

**mastra** (`Mastra`): The Mastra instance containing registered agents.

**agentId** (`string`): The ID of the agent to use for chat.

**agentVersion** (`{ versionId: string } | { status?: 'draft' | 'published' }`): Selects a specific agent version. Pass { versionId: '\<id>' } to target an exact version, or { status: 'draft' } / { status: 'published' } to resolve by status. Requires the Editor to be configured.

**params** (`ChatStreamHandlerParams`): Parameters for the chat stream, including messages and optional resume data.

**params.messages** (`UIMessage[]`): Array of messages in the conversation.

**params.resumeData** (`Record<string, any>`): Data for resuming a suspended agent execution. Requires runId to be set.

**params.runId** (`string`): The run ID. Required when resumeData is provided.

**params.providerOptions** (`Record<string, Record<string, unknown>>`): Provider-specific options passed to the language model (e.g. { openai: { reasoningEffort: "high" } }). Merged with defaultOptions.providerOptions, with params taking precedence.

**params.requestContext** (`RequestContext`): Request context to pass to the agent execution.

**defaultOptions** (`AgentExecutionOptions`): Default options passed to agent execution. These are merged with params, with params taking precedence.

**sendStart** (`boolean`): Whether to send start events in the stream. (Default: `true`)

**sendFinish** (`boolean`): Whether to send finish events in the stream. (Default: `true`)

**sendReasoning** (`boolean`): Whether to include reasoning steps in the stream. (Default: `false`)

**sendSources** (`boolean`): Whether to include source citations in the stream. (Default: `false`)

**onError** (`(error: unknown) => string`): Called when the stream encounters an error. Return the string that will be sent to the client as the error message. Use this to sanitize errors before they reach the client — for example, to prevent internal infrastructure details from leaking to end users.

**messageMetadata** (`(options: { part: UIMessageStreamPart }) => Record<string, unknown> | undefined`): A function that receives the current stream part and returns metadata to attach to start and finish chunks. See the AI SDK message metadata docs for details.