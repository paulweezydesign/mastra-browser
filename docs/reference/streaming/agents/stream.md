> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Agent.stream()

The `.stream()` method enables real-time streaming of responses from an agent with enhanced capabilities and format flexibility. This method accepts messages and optional streaming options, providing a current streaming experience with support for both Mastra's native format and AI SDK v5+ compatibility.

## Usage example

```ts
const stream = await agent.stream('message for agent')
```

> **Info:** **Model Compatibility**: This method is designed for V2 models. V1 models should use the [`.streamLegacy()`](https://mastra.ai/reference/streaming/agents/streamLegacy) method. The framework automatically detects your model version and will throw an error if there's a mismatch.

## Parameters

**messages** (`string | string[] | CoreMessage[] | AiMessageType[] | UIMessageWithMetadata[]`): The messages to send to the agent. Can be a single string, array of strings, or structured message objects.

**options** (`AgentExecutionOptions<Output, Format>`): Optional configuration for the streaming process.

**options.maxSteps** (`number`): Maximum number of steps to run during execution.

**options.scorers** (`MastraScorers | Record<string, { scorer: MastraScorer['name']; sampling?: ScoringSamplingConfig }>`): Evaluation scorers to run on the execution results.

**options.scorers.scorer** (`string`): Name of the scorer to use.

**options.scorers.sampling** (`ScoringSamplingConfig`): Sampling configuration for the scorer.

**options.scorers.sampling.type** (`'none' | 'ratio'`): Type of sampling strategy. Use 'none' to disable sampling or 'ratio' for percentage-based sampling.

**options.scorers.sampling.rate** (`number`): Sampling rate (0-1). Required when type is 'ratio'.

**options.onIterationComplete** (`(context: IterationCompleteContext) => { continue?: boolean; feedback?: string } | void | Promise<{ continue?: boolean; feedback?: string } | void>`): Callback function called after each iteration completes. Use this to monitor progress, provide feedback to guide the agent, or stop execution early. The callback receives context about the iteration including the current text, tool calls, and finish reason.

**options.onIterationComplete.context.iteration** (`number`): Current iteration number (1-based).

**options.onIterationComplete.context.maxIterations** (`number | undefined`): Maximum iterations allowed (if set).

**options.onIterationComplete.context.text** (`string`): The text response from this iteration.

**options.onIterationComplete.context.isFinal** (`boolean`): Whether this is the final iteration.

**options.onIterationComplete.context.finishReason** (`string`): Reason why this iteration finished (e.g., 'stop', 'length', 'tool-calls').

**options.onIterationComplete.context.toolCalls** (`ToolCall[]`): Tool calls made in this iteration.

**options.onIterationComplete.context.messages** (`MastraDBMessage[]`): All messages accumulated so far.

**options.onIterationComplete.return.continue** (`boolean`): Set to false to stop execution early.

**options.onIterationComplete.return.feedback** (`string`): Feedback message to guide the agent's next iteration.

**options.isTaskComplete** (`IsTaskCompleteConfig`): Task completion scoring configuration that validates whether the task is complete. Uses Mastra's evaluation scorers to automatically check if the agent's response satisfies the completion criteria.

**options.isTaskComplete.scorers** (`MastraScorer[]`): Array of scorers that evaluate task completion. Each scorer returns 0 (failed) or 1 (passed).

**options.isTaskComplete.strategy** (`'all' | 'any'`): Strategy for combining scorer results. 'all' requires all scorers to pass, 'any' requires at least one.

**options.isTaskComplete.onComplete** (`(result: IsTaskCompleteRunResult) => void | Promise<void>`): Callback called when the task completion check finishes. Receives the result with individual scorer scores.

**options.isTaskComplete.parallel** (`boolean`): Whether to run scorers in parallel.

**options.isTaskComplete.timeout** (`number`): Maximum time in milliseconds to wait for all scorers to complete.

**options.isTaskComplete.suppressFeedback** (`boolean`): When true, marks the completion check feedback so consumers can hide it from displayed output. Feedback is only added to the conversation when the check fails, to guide the next iteration.

**options.delegation** (`DelegationConfig`): Configuration for subagent delegation. Use this to control and monitor when the agent delegates tasks to other agents, including the ability to modify, reject delegations, and provide feedback to guide the supervisor.

**options.delegation.onDelegationStart** (`(context: DelegationStartContext) => DelegationStartResult | void | Promise<DelegationStartResult | void>`): Called before delegating to a subagent. Use this to modify the delegation parameters, reject the delegation entirely, or mutate context.requestContext to add entries to the subagent run's request context.

**options.delegation.onDelegationComplete** (`(context: DelegationCompleteContext) => { feedback?: string } | void | Promise<{ feedback?: string } | void>`): Called after a subagent delegation completes. The context includes a bail() method to stop further execution, and you can return { feedback } to guide the supervisor's next action. Feedback is saved to supervisor memory as an assistant message.

**options.delegation.messageFilter** (`(context: MessageFilterContext) => MastraDBMessage[] | Promise<MastraDBMessage[]>`): Callback function called before delegating to a subagent. Use this to filter the messages that are passed to the subagent.

**options.tracingContext** (`TracingContext`): Tracing context for span hierarchy and metadata.

**options.returnScorerData** (`boolean`): Whether to return detailed scoring data in the response.

**options.onChunk** (`(chunk: ChunkType) => Promise<void> | void`): Callback function called for each chunk during streaming.

**options.onError** (`({ error }: { error: Error | string }) => Promise<void> | void`): Callback function called when an error occurs during streaming.

**options.onAbort** (`(event: any) => Promise<void> | void`): Callback function called when the stream is aborted.

**options.abortSignal** (`AbortSignal`): Signal object that allows you to abort the agent's execution. When the signal is aborted, all ongoing operations will be terminated, including any in-flight subagent runs the agent delegated to.

**options.activeTools** (`Array<keyof ToolSet> | undefined`): Array of active tool names that can be used during execution.

**options.prepareStep** (`PrepareStepFunction<any>`): Callback function called before each step of multi-step execution.

**options.context** (`ModelMessage[]`): Additional context messages to provide to the agent.

**options.structuredOutput** (`StructuredOutputOptions<S extends ZodTypeAny = ZodTypeAny>`): Options to fine tune your structured output generation.

**options.structuredOutput.schema** (`StandardJSONSchemaV1`): Standard JSON Schema defining the expected output structure.

**options.structuredOutput.model** (`MastraLanguageModel`): Language model to use for structured output generation. If provided, enables the agent to respond in multi step with tool calls, text, and structured output

**options.structuredOutput.errorStrategy** (`'strict' | 'warn' | 'fallback'`): Strategy for handling schema validation errors. 'strict' throws errors, 'warn' logs warnings, 'fallback' uses fallback values.

**options.structuredOutput.fallbackValue** (`<S extends ZodTypeAny>`): Fallback value to use when schema validation fails and errorStrategy is 'fallback'.

**options.structuredOutput.instructions** (`string`): Additional instructions for the structured output model.

**options.structuredOutput.jsonPromptInjection** (`boolean | 'system' | 'inline' | 'auto'`): Controls how the JSON schema reaches the model. Set to 'auto' to use native structured output when supported and inline prompt injection otherwise.

**options.structuredOutput.providerOptions** (`ProviderOptions`): Provider-specific options passed to the internal structuring agent. Use this to control model behavior like reasoning effort for thinking models (e.g., { openai: { reasoningEffort: 'low' } }).

**options.outputProcessors** (`Processor[]`): Overrides the output processors set on the agent. Output processors that can modify or validate messages from the agent before they are returned to the user. Must implement either (or both) of the processOutputResult and processOutputStream functions.

**options.includeRawChunks** (`boolean`): Whether to include raw chunks in the stream output (not available on all model providers).

**options.inputProcessors** (`Processor[]`): Overrides the input processors set on the agent. Input processors that can modify or validate messages before they are processed by the agent. Must implement the processInput function.

**options.instructions** (`string`): Custom instructions that override the agent's default instructions for this specific generation. Useful for dynamically modifying agent behavior without creating a new agent instance.

**options.system** (`string | string[] | CoreSystemMessage | SystemModelMessage | CoreSystemMessage[] | SystemModelMessage[]`): Custom system message(s) to include in the prompt. Can be a single string, message object, or array of either. System messages provide additional context or behavior instructions that supplement the agent's main instructions.

**options.output** (`Zod schema | JsonSchema7`): \*\*Deprecated.\*\* Use structuredOutput without a model to achieve the same thing. Defines the expected structure of the output. Can be a JSON Schema object or a Zod schema.

**options.memory** (`object`): Configuration for memory. This is the preferred way to manage memory.

**options.memory.thread** (`string | { id: string; metadata?: Record<string, any>, title?: string }`): The conversation thread, as a string ID or an object with an id and optional metadata.

**options.memory.resource** (`string`): Identifier for the user or resource associated with the thread.

**options.memory.options** (`MemoryConfig`): Configuration for memory behavior including lastMessages, readOnly, semanticRecall, workingMemory, and filterIncompleteToolCalls.

**options.memory.onTitleGenerated** (`(title: string) => void | Promise<void>`): Callback fired asynchronously when a thread title is generated and persisted to storage. Title generation runs in the background and may complete after the stream ends. Only fires when generateTitle is enabled in memory options and the thread has no existing title.

**options.onFinish** (`StreamTextOnFinishCallback<any> | StreamObjectOnFinishCallback<OUTPUT>`): Callback function called when streaming completes. Receives the final result.

**options.onStepFinish** (`StreamTextOnStepFinishCallback<any> | never`): Callback function called after each execution step. Receives step details as a JSON string. Unavailable for structured output

**options.telemetry** (`TelemetrySettings`): Settings for OTLP telemetry collection during streaming (not Tracing).

**options.telemetry.isEnabled** (`boolean`): Enable or disable telemetry. Disabled by default while experimental.

**options.telemetry.recordInputs** (`boolean`): Enable or disable input recording. Enabled by default. You might want to disable input recording to avoid recording sensitive information.

**options.telemetry.recordOutputs** (`boolean`): Enable or disable output recording. Enabled by default. You might want to disable output recording to avoid recording sensitive information.

**options.telemetry.functionId** (`string`): Identifier for this function. Used to group telemetry data by function.

**options.modelSettings** (`CallSettings`): Model-specific settings like temperature, maxOutputTokens, topP, etc. These settings control how the language model generates responses.

**options.modelSettings.temperature** (`number`): Controls randomness in generation (0-2). Higher values make output more random.

**options.modelSettings.maxOutputTokens** (`number`): Maximum number of tokens to generate in the response. Note: Use maxOutputTokens (not maxTokens) as per AI SDK v5 convention.

**options.modelSettings.maxRetries** (`number`): Maximum number of retry attempts for failed requests.

**options.modelSettings.topP** (`number`): Nucleus sampling parameter (0-1). Controls diversity of generated text.

**options.modelSettings.topK** (`number`): Top-k sampling parameter. Limits vocabulary to k most likely tokens.

**options.modelSettings.presencePenalty** (`number`): Penalty for token presence (-2 to 2). Reduces repetition.

**options.modelSettings.frequencyPenalty** (`number`): Penalty for token frequency (-2 to 2). Reduces repetition of frequent tokens.

**options.modelSettings.stopSequences** (`string[]`): Stop sequences. If set, the model will stop generating text when one of the stop sequences is generated.

**options.toolChoice** (`'auto' | 'none' | 'required' | { type: 'tool'; toolName: string }`): Controls how the agent uses tools during streaming.

**options.toolChoice.'auto'** (`string`): Let the model decide whether to use tools (default).

**options.toolChoice.'none'** (`string`): Do not use any tools.

**options.toolChoice.'required'** (`string`): Require the model to use at least one tool.

**options.toolChoice.{ type: 'tool'; toolName: string }** (`object`): Require the model to use a specific tool by name.

**options.toolsets** (`ToolsetsInput`): Additional toolsets to make available to the agent during streaming.

**options.clientTools** (`ToolsInput`): Tools that are executed on the 'client' side of the request. These tools do not have execute functions in the definition.

**options.hooks** (`ToolHooks`): Per-execution hooks that run before and after tool calls. Overrides matching agent-level hooks for this execution. beforeToolCall can return { proceed: false, output } to skip the tool call.

**options.savePerStep** (`boolean`): Save messages incrementally after each stream step completes (default: false).

**options.requireToolApproval** (`boolean`): When true, all tool calls require explicit approval before execution. The stream will emit tool-call-approval chunks and pause until approveToolCall() or declineToolCall() is called.

**options.autoResumeSuspendedTools** (`boolean`): When true, automatically resumes suspended tools when the user sends a new message on the same thread. The agent extracts resumeData from the user's message based on the tool's resumeSchema. Requires memory to be configured.

**options.toolCallConcurrency** (`number`): Maximum number of tool calls to execute concurrently. Defaults to 1 when approval may be required, otherwise 10.

**options.providerOptions** (`Record<string, Record<string, JSONValue>>`): Additional provider-specific options that are passed through to the underlying LLM provider. The structure is { providerName: { optionKey: value } }. For example: { openai: { reasoningEffort: 'high' }, anthropic: { maxTokens: 1000 } }.

**options.providerOptions.openai** (`Record<string, JSONValue>`): OpenAI-specific options. Example: { reasoningEffort: 'high' }

**options.providerOptions.anthropic** (`Record<string, JSONValue>`): Anthropic-specific options. Example: { maxTokens: 1000 }

**options.providerOptions.google** (`Record<string, JSONValue>`): Google-specific options. Example: { safetySettings: \[...] }

**options.providerOptions.\[providerName]** (`Record<string, JSONValue>`): Other provider-specific options. The key is the provider name and the value is a record of provider-specific options.

**options.runId** (`string`): Unique ID for this generation run. Useful for tracking and debugging purposes.

**options.requestContext** (`RequestContext`): Request Context for dependency injection and contextual information.

**options.tracingContext** (`TracingContext`): Tracing context for creating child spans and adding metadata. Automatically injected when using Mastra's tracing system.

**options.tracingContext.currentSpan** (`Span`): Current span for creating child spans and adding metadata. Use this to create custom child spans or update span attributes during execution.

**options.tracingOptions** (`TracingOptions`): Options for Tracing configuration.

**options.tracingOptions.metadata** (`Record<string, any>`): Metadata to add to the root trace span. Useful for adding custom attributes like user IDs, session IDs, or feature flags.

**options.tracingOptions.requestContextKeys** (`string[]`): Additional RequestContext keys to extract as metadata for this trace. Supports dot notation for nested values (e.g., 'user.id').

**options.tracingOptions.traceId** (`string`): Trace ID to use for this execution (1-32 hexadecimal characters). If provided, this trace will be part of the specified trace.

**options.tracingOptions.parentSpanId** (`string`): Parent span ID to use for this execution (1-16 hexadecimal characters). If provided, the root span will be created as a child of this span.

**options.tracingOptions.tags** (`string[]`): Tags to apply to this trace. String labels for categorizing and filtering traces.

**options.versions** (`VersionOverrides`): Per-invocation version overrides for sub-agent delegation. Merged on top of Mastra instance-level versions and propagated automatically through sub-agent calls via requestContext. Requires the editor package. See Editor versioning.

**options.versions.agents** (`Record<string, VersionSelector>`): A map of agent IDs to their version selectors.

**options.versions.agents.versionId** (`string`): Target a specific version by ID.

**options.versions.agents.status** (`'draft' | 'published'`): Target the latest version with this publication status.

**options.untilIdle** (`boolean | { maxIdleMs?: number }`): When set, keeps the stream open across background-task continuations. The agent will automatically re-invoke the LLM when background tasks complete, streaming continuation turns through the same fullStream. Pass true for default settings (5 min idle timeout), or an object with maxIdleMs to configure. Requires memory. Replaces the standalone streamUntilIdle() method.

**options.untilIdle.maxIdleMs** (`number`): Closes the outer stream after this many ms of idleness between turns. The timer only runs while the wrapper is between turns. Default: 5 minutes.

## Returns

**stream** (`MastraModelOutput<Output>`): Returns a MastraModelOutput instance that provides access to the streaming output.

**traceId** (`string`): The trace ID associated with this execution when Tracing is enabled. Use this to correlate logs and debug execution flow.

**spanId** (`string`): The root span ID associated with this execution when Tracing is enabled. Use this for span-level lookup and correlation.

## Extended usage example

### Mastra Format (Default)

```ts
import { stepCountIs } from 'ai-v5'

const stream = await agent.stream('Tell me a story', {
  stopWhen: stepCountIs(3), // Stop after 3 steps
  modelSettings: {
    temperature: 0.7,
  },
})

// Access text stream
for await (const chunk of stream.textStream) {
  console.log(chunk)
}

// or access full stream
for await (const chunk of stream.fullStream) {
  console.log(chunk)
}

// Get full text after streaming
const fullText = await stream.text
```

### AI SDK v5+ Format

To use the stream with AI SDK v5 (and later), you can convert it using our utility function `toAISdkStream`.

```ts
import { stepCountIs, createUIMessageStreamResponse } from 'ai'
import { toAISdkStream } from '@mastra/ai-sdk'

const stream = await agent.stream('Tell me a story', {
  stopWhen: stepCountIs(3), // Stop after 3 steps
  modelSettings: {
    temperature: 0.7,
  },
})

// In an API route for frontend integration
return createUIMessageStreamResponse({
  stream: toAISdkStream(stream, { from: 'agent' }),
})
```

### Using Callbacks

All callback functions are now available as top-level properties for a cleaner API experience.

```ts
const stream = await agent.stream('Tell me a story', {
  onFinish: result => {
    console.log('Streaming finished:', result)
  },
  onStepFinish: step => {
    console.log('Step completed:', step)
  },
  onChunk: chunk => {
    console.log('Received chunk:', chunk)
  },
  onError: ({ error }) => {
    console.error('Streaming error:', error)
  },
  onAbort: event => {
    console.log('Stream aborted:', event)
  },
})

// Process the stream
for await (const chunk of stream.textStream) {
  console.log(chunk)
}
```

### Advanced example with Options

```ts
import { z } from 'zod'
import { stepCountIs } from 'ai'

await agent.stream('message for agent', {
  stopWhen: stepCountIs(3), // Stop after 3 steps
  modelSettings: {
    temperature: 0.7,
  },
  memory: {
    thread: 'user-123',
    resource: 'test-app',
  },
  toolChoice: 'auto',
  // Structured output with better DX
  structuredOutput: {
    schema: z.object({
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      confidence: z.number(),
    }),
    model: 'openai/gpt-5.6-sol',
    errorStrategy: 'warn',
  },
  // Output processors for streaming response validation
  outputProcessors: [
    new ModerationProcessor({ model: 'openrouter/openai/gpt-oss-safeguard-20b' }),
    new BatchPartsProcessor({ maxBatchSize: 3, maxWaitTime: 100 }),
  ],
})
```

## Responses WebSocket transport

Opt into Responses WebSocket streaming with provider options. This only applies to streaming calls and is supported for direct OpenAI models and Azure OpenAI Responses deployments. If WebSocket streaming is unavailable, Mastra falls back to HTTP streaming. By default, Mastra closes the WebSocket when the stream finishes.

```ts
const stream = await agent.stream('Hello', {
  providerOptions: {
    openai: {
      transport: 'websocket', // 'websocket' | 'fetch' | 'auto'
      websocket: {
        url: 'wss://api.openai.com/v1/responses',
        closeOnFinish: true, // default
      },
    },
  },
})
```

For Azure OpenAI, configure the gateway with `useResponsesAPI: true`, then use `providerOptions.azure.transport`.

```ts
const stream = await agent.stream('Hello', {
  providerOptions: {
    azure: {
      transport: 'websocket',
      store: false,
      websocket: { closeOnFinish: true },
    },
  },
})
```

To keep the connection open after the stream finishes, set `closeOnFinish: false` and close it manually.

```ts
const stream = await agent.stream('Hello', {
  providerOptions: {
    openai: {
      transport: 'websocket',
      websocket: { closeOnFinish: false },
    },
  },
})

// Later, when you're done with the connection:
stream.transport?.close()
```

Responses WebSocket connections run one response at a time. Mastra rejects overlapping continuation requests that include `previous_response_id` on the same WebSocket transport. Wait for the active stream to finish before sending the next turn in the response chain.

## Related

- [Generating responses](https://mastra.ai/docs/agents/overview)
- [Streaming responses](https://mastra.ai/docs/agents/overview)
- [Agent Approval](https://mastra.ai/docs/agents/agent-approval)