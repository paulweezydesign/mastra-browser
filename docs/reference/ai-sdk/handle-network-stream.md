> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# handleNetworkStream()

> **Deprecated:** Agent networks are deprecated and will be removed in a future release. Use [supervisor agents](https://mastra.ai/docs/capabilities/subagents) with `agent.stream()` or `agent.generate()` instead. See the [migration guide](https://mastra.ai/guides/migrations/network-to-supervisor) to upgrade.

Framework-agnostic handler for streaming network execution in AI SDK-compatible format. Use this function directly when you need to handle network streaming outside Hono or Mastra's own [apiRoutes](https://mastra.ai/docs/server/custom-api-routes) feature.

`handleNetworkStream()` returns a `ReadableStream` that you can wrap with [`createUIMessageStreamResponse()`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/create-ui-message-stream-response).

`handleNetworkStream()` keeps the existing AI SDK v5/default behavior. If your app is typed against AI SDK v6, pass `version: 'v6'`.

Use [`networkRoute()`](https://mastra.ai/reference/ai-sdk/network-route) if you want to create a network route inside a Mastra server.

## Usage example

Next.js App Router example:

```typescript
import { handleNetworkStream } from '@mastra/ai-sdk'
import { createUIMessageStreamResponse } from 'ai'
import { mastra } from '@/src/mastra'

export async function POST(req: Request) {
  const params = await req.json()
  const stream = await handleNetworkStream({
    mastra,
    agentId: 'routingAgent',
    params,
  })
  return createUIMessageStreamResponse({ stream })
}
```

## Parameters

**version** (`'v5' | 'v6'`): Selects the AI SDK stream contract to emit. Omit it or pass 'v5' for the existing default behavior. Pass 'v6' when your app is typed against AI SDK v6 response helpers. (Default: `'v5'`)

**mastra** (`Mastra`): The Mastra instance to use for agent lookup and execution.

**agentId** (`string`): The ID of the routing agent to execute as a network.

**agentVersion** (`{ versionId: string } | { status?: 'draft' | 'published' }`): Selects a specific agent version. Pass { versionId: '\<id>' } to target an exact version, or { status: 'draft' } / { status: 'published' } to resolve by status. Requires the Editor to be configured.

**params** (`NetworkStreamHandlerParams`): The request parameters containing messages and execution options. Includes messages (required) and any AgentExecutionOptions like memory, maxSteps, runId, etc.

**defaultOptions** (`AgentExecutionOptions`): Default options passed to agent execution. These are merged with params, with params taking precedence.