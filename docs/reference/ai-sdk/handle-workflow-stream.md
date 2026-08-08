> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# handleWorkflowStream()

Framework-agnostic handler for streaming workflow execution in AI SDK-compatible format. Use this function directly when you need to handle workflow streaming outside Hono or Mastra's own [apiRoutes](https://mastra.ai/docs/server/custom-api-routes) feature.

`handleWorkflowStream()` returns a `ReadableStream` that you can wrap with [`createUIMessageStreamResponse()`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/create-ui-message-stream-response).

`handleWorkflowStream()` keeps the existing AI SDK v5/default behavior. If your app is typed against AI SDK v6, pass `version: 'v6'`.

Use [`workflowRoute()`](https://mastra.ai/reference/ai-sdk/workflow-route) if you want to create a workflow route inside a Mastra server.

> **Agent streaming in workflows:** When a workflow step pipes an agent's stream to the workflow writer (e.g., `await response.fullStream.pipeTo(writer)`), the agent's text chunks and tool calls are forwarded to the UI stream in real time, even when the agent runs inside workflow steps.
>
> See [Workflow Streaming](https://mastra.ai/docs/workflows/overview) for more details.

## Usage example

Next.js App Router example:

```typescript
import { handleWorkflowStream } from '@mastra/ai-sdk'
import { createUIMessageStreamResponse } from 'ai'
import { mastra } from '@/src/mastra'

export async function POST(req: Request) {
  const params = await req.json()
  const stream = await handleWorkflowStream({
    mastra,
    workflowId: 'weatherWorkflow',
    params,
  })
  return createUIMessageStreamResponse({ stream })
}
```

## Parameters

**version** (`'v5' | 'v6'`): Selects the AI SDK stream contract to emit. Omit it or pass 'v5' for the existing default behavior. Pass 'v6' when your app is typed against AI SDK v6 response helpers. (Default: `'v5'`)

**mastra** (`Mastra`): The Mastra instance containing registered workflows.

**workflowId** (`string`): The ID of the workflow to execute.

**params** (`WorkflowStreamHandlerParams`): Parameters for the workflow stream.

**params.runId** (`string`): Optional run ID for the workflow execution.

**params.resourceId** (`string`): Optional resource ID for the workflow run.

**params.inputData** (`Record<string, any>`): Input data for starting a new workflow execution.

**params.resumeData** (`Record<string, any>`): Data for resuming a suspended workflow execution.

**params.requestContext** (`RequestContext`): Request context to pass to the workflow execution.

**params.tracingOptions** (`TracingOptions`): Options for tracing and observability.

**params.step** (`string`): Specific step to target in the workflow.

**includeTextStreamParts** (`boolean`): Whether to include text stream parts in the output. (Default: `true`)