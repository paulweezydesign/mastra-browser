> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# `createInngestAgent()`

`createInngestAgent()` wraps an existing [`Agent`](https://mastra.ai/reference/agents/agent) with [Inngest](https://www.inngest.com/docs)-powered durable execution. Like [`createDurableAgent()`](https://mastra.ai/reference/agents/durable-agent), it streams events over [PubSub](https://mastra.ai/docs/server/pubsub) and supports resumable streams, but runs the agentic loop on Inngest's execution engine instead of in-process. Use it when a run must survive process restarts or run in a distributed environment.

For in-process durable execution, use [`createDurableAgent()`](https://mastra.ai/reference/agents/durable-agent). For fire-and-forget execution on the built-in workflow engine, use [`createEventedAgent()`](https://mastra.ai/reference/agents/durable-agent).

## Usage example

Set up the Inngest client, wrap an agent, register it with Mastra, and expose the Inngest serve endpoint:

```typescript
import { Mastra } from '@mastra/core'
import { Agent } from '@mastra/core/agent'
import { createInngestAgent, serve as inngestServe } from '@mastra/inngest'
import { Inngest } from 'inngest'

const inngest = new Inngest({ id: 'my-app' })

const agent = new Agent({
  id: 'my-agent',
  name: 'My Agent',
  instructions: 'You are a helpful assistant',
  model: 'openai/gpt-5.6-sol',
})

const durableAgent = createInngestAgent({ agent, inngest })

export const mastra = new Mastra({
  agents: { myAgent: durableAgent },
  server: {
    apiRoutes: [
      {
        path: '/inngest/api',
        method: 'ALL',
        createHandler: async ({ mastra }) => inngestServe({ mastra, inngest }),
      },
    ],
  },
})
```

Stream a response and read the result:

```typescript
const { output, runId, cleanup } = await durableAgent.stream('Hello!')

const text = await output.text

cleanup()
```

## `createInngestAgent(options)`

Wraps an `Agent` with Inngest-powered durable execution and resumable streams.

```typescript
import { createInngestAgent } from '@mastra/inngest'

const durableAgent = createInngestAgent({ agent, inngest })
```

Returns: [`InngestAgent`](#inngestagent-interface)

### Parameters

**agent** (`Agent`): The Agent to wrap with Inngest durable execution. Methods not implemented by InngestAgent (e.g., listTools() and getMemory()) delegate to this agent via a Proxy.

**inngest** (`Inngest`): The Inngest client instance. Used to send workflow events and, in SDK v4, publish realtime stream events.

**id** (`string`): ID override. (Default: `agent.id`)

**name** (`string`): Name override. (Default: `agent.name`)

**pubsub** (`PubSub`): PubSub instance for streaming events. The default InngestPubSub uses Inngest Realtime, which works across processes. (Default: `InngestPubSub`)

**cache** (`MastraServerCache`): Cache for stored stream events, which enables resumable streams. When provided, the PubSub is automatically wrapped with CachingPubSub. If omitted, the agent inherits the cache from the Mastra instance.

**mastra** (`Mastra`): Mastra instance for observability. Set automatically when the agent is registered with Mastra.

## `InngestAgent` interface

The object returned by `createInngestAgent()`. It provides the durable execution methods below. Any property or method not explicitly defined (e.g., `listTools()` and `getMemory()`) is forwarded to the underlying agent via a Proxy.

### Properties

**id** (`string`): The agent ID.

**name** (`string`): The agent name.

**agent** (`Agent`): The underlying Mastra Agent.

**inngest** (`Inngest`): The Inngest client.

**cache** (`MastraServerCache | undefined`): The resolved cache instance, if resumable streams are enabled.

**pubsub** (`PubSub`): The PubSub instance used for streaming events.

## Methods

### Execution

#### `stream(messages, options?)`

Streams a response using Inngest's durable execution engine. The workflow is triggered via an Inngest event after the PubSub subscription is established.

```typescript
const { output, runId, cleanup } = await durableAgent.stream('Hello!', {
  onChunk: chunk => console.log(chunk),
  onFinish: result => console.log('done', result),
})

const text = await output.text
cleanup()
```

Returns: [`Promise<InngestAgentStreamResult>`](#inngestagentstreamresult)

#### `resume(runId, resumeData, options?)`

Resumes a suspended Inngest run, for example after a tool approval. Loads the workflow snapshot from storage, finds the suspended step, and sends a resume event to Inngest.

```typescript
const { output, cleanup } = await durableAgent.resume(
  runId,
  {
    approved: true,
  },
  { threadId: 'thread-1', resourceId: 'user-1' },
)

await output.text
cleanup()
```

The third argument accepts `threadId` and `resourceId` in addition to the lifecycle callbacks:

**threadId** (`string`): Thread ID to associate with the resumed run.

**resourceId** (`string`): Resource ID to associate with the resumed run.

**onChunk** (`(chunk: ChunkType) => void | Promise<void>`): Called for each streamed chunk.

**onStepFinish** (`(result: AgentStepFinishEventData) => void | Promise<void>`): Called when a step in the agentic loop finishes.

**onFinish** (`(result: AgentFinishEventData) => void | Promise<void>`): Called when the run finishes.

**onError** (`(error: Error) => void | Promise<void>`): Called when the run errors.

**onSuspended** (`(data: AgentSuspendedEventData) => void | Promise<void>`): Called when the run suspends.

Returns: [`Promise<InngestAgentStreamResult>`](#inngestagentstreamresult)

#### `generate(messages, options?)`

Runs a response on Inngest's durable execution engine and resolves with a single `FullOutput`. If the run suspends, `generate()` resolves with `finishReason: 'suspended'`. The `runId` option is optional. If you omit it, `generate()` creates a run ID and returns it in `result.runId`. Continue the run with [`resumeGenerate()`](#resumegeneraterunid-resumedata-options). Use [`stream()`](#streammessages-options) with `onSuspended` when the caller needs a suspension callback.

```typescript
const result = await durableAgent.generate('Delete the old records', {
  requireToolApproval: true,
})

result.runId // Generated automatically
result.finishReason // 'suspended' when approval is required
```

Returns: `Promise<FullOutput<TOutput>>`

#### `resumeGenerate(runId, resumeData, options?)`

Resumes a suspended `generate()` run and resolves with a single `FullOutput`.

```typescript
if (!result.runId) {
  throw new Error('Run ID is missing')
}

const resumedResult = await durableAgent.resumeGenerate(result.runId, { approved: true })
```

Returns: `Promise<FullOutput<TOutput>>`

#### `observe(runId, options?)`

Reconnects to an existing run, replaying cached events before delivering live ones. Use this after a network disconnection. Pass `offset` to start replay from a known position.

```typescript
const { output, cleanup } = await durableAgent.observe(runId, {
  offset: 0,
  onChunk: chunk => console.log(chunk),
})

await output.text
```

The result from `observe()` doesn't include `threadId` or `resourceId`.

Returns: `Promise<Omit<InngestAgentStreamResult, 'threadId' | 'resourceId'>>`

> **Warning:** The `cleanup()` returned by `observe()` destroys the run's registry entries and cached events. Only call it when you are done with the run. If the run is suspended and you intend to resume later, don't call `cleanup()`.

#### `prepare(messages, options?)`

Prepares a run for durable execution without triggering it. Returns the serialized workflow input that can be used to manually trigger the Inngest workflow event.

```typescript
const { runId, messageId, workflowInput, threadId, resourceId } = await durableAgent.prepare(
  'Summarize the document',
  {
    memory: { threadId: 'thread-1', resourceId: 'user-1' },
  },
)
```

Returns:

```typescript
interface PrepareResult {
  runId: string
  messageId: string
  workflowInput: any
  threadId?: string
  resourceId?: string
}
```

### Introspection

#### `isInngestAgent(obj)`

Type guard that checks whether an object is an `InngestAgent`.

```typescript
import { isInngestAgent } from '@mastra/inngest'

if (isInngestAgent(agent)) {
  // agent is InngestAgent
}
```

Returns: `boolean`

## Stream options

`stream()` accepts an `InngestAgentStreamOptions` object. It supports the same agent execution options as [`DurableAgent.stream()`](https://mastra.ai/reference/agents/durable-agent), plus lifecycle callbacks.

**runId** (`string`): Unique identifier for this run. Use it later with resume() or observe().

**instructions** (`AgentExecutionOptions['instructions']`): Overrides the agent's default instructions for this run.

**context** (`ModelMessage[]`): Additional context messages to provide to the agent.

**memory** (`object`): Memory configuration for conversation persistence and retrieval.

**requestContext** (`RequestContext`): Request context carrying dynamic configuration and state for this run.

**maxSteps** (`number`): Maximum number of steps to run.

**toolsets** (`object`): Additional tool sets available for this run.

**clientTools** (`object`): Client-side tools available during execution.

**toolChoice** (`'auto' | 'none' | 'required' | { type: 'tool'; toolName: string }`): Tool selection strategy.

**modelSettings** (`object`): Model-specific settings such as temperature.

**requireToolApproval** (`boolean`): Require approval for all tool calls, which suspends the run until resumed.

**autoResumeSuspendedTools** (`boolean`): Automatically resume tools that suspended, instead of waiting for an external resume() call.

**toolCallConcurrency** (`number`): Maximum number of tool calls to execute concurrently.

**includeRawChunks** (`boolean`): Include raw provider chunks in the stream output.

**maxProcessorRetries** (`number`): Maximum number of processor retries per generation.

**untilIdle** (`boolean | { maxIdleMs?: number }`): When set, keeps the stream open across background-task continuations until the agent is idle. Pass true for the default 5-minute idle timeout, or { maxIdleMs } to customise.

**onChunk** (`(chunk: ChunkType) => void | Promise<void>`): Called for each streamed chunk.

**onStepFinish** (`(result: AgentStepFinishEventData) => void | Promise<void>`): Called when a step in the agentic loop finishes.

**onFinish** (`(result: AgentFinishEventData) => void | Promise<void>`): Called when the run finishes.

**onError** (`(error: Error) => void | Promise<void>`): Called when the run errors.

**onSuspended** (`(data: AgentSuspendedEventData) => void | Promise<void>`): Called when the run suspends, for example for tool approval.

`observe()` accepts the lifecycle callbacks (`onChunk`, `onStepFinish`, `onFinish`, `onError`, `onSuspended`) plus an `offset` to control where replay starts.

## `InngestAgentStreamResult`

The object returned by `stream()` and `resume()`. The `observe()` method returns the same shape but omits `threadId` and `resourceId`.

```typescript
interface InngestAgentStreamResult<OUTPUT = undefined> {
  output: MastraModelOutput<OUTPUT>
  readonly fullStream: ReadableStream<any>
  runId: string
  threadId?: string
  resourceId?: string
  cleanup: () => void
}
```

**output** (`MastraModelOutput`): The streaming output. Await output.text for the full text, or consume output.fullStream.

**fullStream** (`ReadableStream`): The full event stream, delegating to output.fullStream.

**runId** (`string`): The unique run ID. Pass it to resume() or observe() to reconnect.

**threadId** (`string`): Thread ID when using memory.

**resourceId** (`string`): Resource ID when using memory.

**cleanup** (`() => void`): Unsubscribes from PubSub and clears registry entries for the run. Call it when done with the run.

## Serving Inngest functions

The `@mastra/inngest` package provides `serve()` and `createServe()` to register Inngest workflow functions with your HTTP framework.

### `serve(options)`

Serves Mastra workflows with Hono (the default framework). Collects all Inngest-backed workflows from Mastra and registers them as Inngest functions.

```typescript
import { serve } from '@mastra/inngest'

app.use('/inngest/api', async c => {
  return serve({ mastra, inngest })(c)
})
```

### `createServe(adapter)`

Factory that accepts any Inngest serve adapter (`inngest/express`, `inngest/fastify`, `inngest/next`, etc.) and returns a serve function for that framework.

```typescript
import { createServe } from '@mastra/inngest'
import { serve } from 'inngest/express'

const serveExpress = createServe(serve)
app.use('/inngest/api', serveExpress({ mastra, inngest }))
```

```typescript
import { createServe } from '@mastra/inngest'
import { serve } from 'inngest/next'

const serveNext = createServe(serve)
export const { GET, POST, PUT } = serveNext({ mastra, inngest })
```

### Serve options

**mastra** (`Mastra`): The Mastra instance containing registered agents and workflows.

**inngest** (`Inngest`): The Inngest client instance.

**functions** (`InngestFunction.Like[]`): Additional Inngest functions to serve alongside Mastra workflows.

**registerOptions** (`RegisterOptions`): Options passed to the Inngest registration handler.

## Related

- [DurableAgent reference](https://mastra.ai/reference/agents/durable-agent)
- [Agent class](https://mastra.ai/reference/agents/agent)
- [Inngest deployment guide](https://mastra.ai/guides/deployment/inngest)
- [PubSub](https://mastra.ai/docs/server/pubsub)