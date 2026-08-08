> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# LiveKit

The `@mastra/livekit` package connects Mastra agents to the LiveKit Agents framework. LiveKit runs the audio pipeline (voice activity detection, speech-to-text, turn detection, text-to-speech, barge-in) and the package bridges reply generation to a Mastra agent's `stream()` call.

See [Realtime voice](https://mastra.ai/guides/voice/realtime-voice) for setup and concepts.

The package has three entry points:

- `@mastra/livekit`: server-side APIs, [`liveKitConnectionRoute()`](#livekitconnectionroute), [`dispatchVoiceSession()`](#dispatchvoicesession), [`pipeAgentReplyToWriter()`](#pipeagentreplytowriter), [`serializeSessionMetadata()`](#livekitsessionmetadata), and [`createEndCallTool()`](#createendcalltool). Import these from Mastra server code. This entry never loads the LiveKit agents runtime.
- `@mastra/livekit/worker`: the worker runtime, [`createLiveKitWorker()`](#createlivekitworker), [`runLiveKitWorker()`](#runlivekitworker), [`chatContextToMessages()`](#chatcontexttomessages), and the session helpers [`speakGreeting()`](#speakgreeting), [`waitForAgentDoneSpeaking()`](#waitforagentdonespeaking), and [`runEndCall()`](#runendcall). Import it only from the worker entry file.
- `@mastra/livekit/plugin`: the LLM-component plugin, [`MastraLLM`](#mastrallm) and [`createRemoteAgentReplyGenerator()`](#createremoteagentreplygenerator). Import it in workers that build their own `voice.AgentSession`. `createRemoteAgentReplyGenerator()` is also exported from `@mastra/livekit/worker` because it plugs into `createLiveKitWorker()`'s `generate` option. `MastraLLM` is plugin-only.

## `createLiveKitWorker()`

Builds a LiveKit agent definition that answers voice sessions with Mastra agents. Use it as the default export of your worker entry file.

```typescript
import { fileURLToPath } from 'node:url'
import { createLiveKitWorker, runLiveKitWorker } from '@mastra/livekit/worker'
import { mastra } from './index'

export default createLiveKitWorker({
  mastra,
  agent: 'support',
  stt: 'deepgram/nova-3',
  tts: 'cartesia/sonic-3',
  turnDetection: 'multilingual',
})

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runLiveKitWorker({ entry: import.meta.url, agentName: 'mastra-voice' })
}
```

### Options

**mastra** (`Mastra`): The Mastra instance whose agents handle voice sessions.

**agent** (`string | (args) => string | Agent | Promise<string | Agent>`): Which Mastra agent answers each session: a fixed agent key or id, or a resolver called per session with the dispatch metadata and job context. Defaults to the agentId from the dispatch metadata.

**workflow** (`string | Workflow | (args) => string | Promise<string>`): Generate each turn's reply with a Mastra workflow instead of an agent: a Workflow instance, a fixed workflow key or id, or a resolver that returns a workflow id per session. The workflow runs once to completion per turn (no suspend or resume). Mutually exclusive with agent; requires workflowInput.

**workflowInput** (`(args: VoiceTurnContext & { metadata }) => unknown | Promise<unknown>`): Maps a turn into the workflow inputData. Required when workflow is set. A stateless mapping that passes the full transcript each turn avoids carrying conversation state in the workflow.

**replyStep** (`string`): Only stream text from this workflow step id. Defaults to every step that writes to its writer.

**resultText** (`(result: unknown) => string | undefined`): Fallback when the workflow streams no text via writer: derive the spoken reply from the final run result.

**generate** (`VoiceReplyGenerator`): Lowest-level escape hatch: supply any reply generator directly (a custom workflow, remote bridge, and so on).

**stt** (`STT | string`): Speech-to-text: a LiveKit plugin instance or an inference model string such as 'deepgram/nova-3'. For per-call selection, set the configuration.stt resolver — it takes precedence, with this option as the fallback.

**tts** (`TTS | string`): Text-to-speech: a LiveKit plugin instance or an inference model string such as 'cartesia/sonic-3'. For per-call selection, set the configuration.tts resolver — it takes precedence, with this option as the fallback.

**vad** (`VAD | 'silero' | false`): Voice activity detection. 'silero' loads the Silero VAD from @livekit/agents-plugin-silero during prewarm. Pass an instance to bring your own, or false to disable. (Default: `'silero'`)

**turnDetection** (`'multilingual' | 'english' | TurnDetectionMode`): End-of-turn detection. 'multilingual' and 'english' load LiveKit's semantic turn detector from @livekit/agents-plugin-livekit. Other values such as 'vad', 'stt', or 'manual' pass through.

**turnHandling** (`Partial<TurnHandlingOptions>`): Turn handling tuning: endpointing delays, interruption sensitivity, preemptive generation. The worker disables preemptiveGeneration unless set here — each preemptive attempt re-runs the Mastra agent and persists a duplicate user message.

**sessionOptions** (`Partial<AgentSessionOptions>`): Extra LiveKit AgentSession options merged over what this helper builds.

**memory** (`false | ((args) => { thread, resource } | false)`): Memory mapping. Defaults to { thread: metadata.threadId ?? room name, resource: metadata.resourceId ?? thread } when the resolved agent has memory configured. Pass false to disable, or a function to customize.

**toolFeedback** (`(toolCall) => string | undefined`): Called when the Mastra agent starts a tool call mid-reply. Return a short phrase to speak while the tool runs.

**onTurnComplete** (`(ctx: VoiceTurnCompleteContext) => void | Promise<void>`): Called once per turn after the reply finished streaming to text-to-speech. Runs off the audio path and is not awaited. The context carries the produced reply (text, toolCalls, interrupted, usage) and the resolved memory mapping.

**configuration** (`LiveKitWorkerConfiguration`): Grouped conversation and compliance configuration: the opening greeting and AI disclosure, consent requirements, agent-initiated hang-up, and per-call STT/TTS selection.

**configuration.greeting** (`GreetingConfiguration`): The opening greeting and AI disclosure: text (a fixed string or a per-call resolver for per-tenant greetings), allowInterruptions, awaitPlayout, persist, and periodic re-disclosure via repeatEvery and repeatText.

**configuration.consentPolicy** (`ConsentConfiguration`): The call's consent policy, as named requirements (starting with summaryStorage). Declarative only — the worker blocks nothing by itself. Capture grants at runtime with createConsentTool and enforce them in your own code; the declared policy surfaces on onCallEnd for cross-checking.

**configuration.endCall** (`EndCallConfiguration`): Agent-initiated hang-up: the worker watches each turn for the end-call tool (pair with createEndCallTool), waits for the agent's closing words to play out, then disconnects — running onCallEnd on the way out.

**configuration.stt** (`(context: VoiceCallContext) => STT | string | undefined`): Per-call speech-to-text: a resolver invoked once per call (post-connect) with { metadata, requestContext, roomName, ctx }, returning anything the top-level stt option accepts. Return undefined to fall back to the top-level stt. Cache plugin instances across calls — the resolver runs during call setup.

**configuration.tts** (`(context: VoiceCallContext) => TTS | string | undefined`): Per-call text-to-speech: a resolver invoked once per call (post-connect) with { metadata, requestContext, roomName, ctx }, returning anything the top-level tts option accepts — one voice or language per tenant. Return undefined to fall back to the top-level tts. Cache plugin instances across calls.

**greeting** (`string`): Static greeting spoken when the session starts. Deprecated: prefer configuration.greeting.text.

**persistGreeting** (`boolean`): Save the spoken greeting to the memory thread as an assistant message, making the saved thread a faithful call transcript. Only applies when a greeting is set and memory is enabled. Deprecated: prefer configuration.greeting.persist. (Default: `true`)

**observability** (`boolean`): Trace each call when the Mastra instance has observability configured. Opens a voice call span per session: every turn's agent run nests under it, LiveKit's STT, TTS, end-of-utterance, VAD, and LLM latency metrics become child spans, and the span closes with a per-model usage roll-up. Pass false to disable. (Default: `true`)

**inputOptions** (`Partial<RoomInputOptions>`): LiveKit room input options passed to session.start().

**outputOptions** (`Partial<RoomOutputOptions>`): LiveKit room output options passed to session.start().

**onSessionStart** (`(args: { session, ctx, agent, metadata }) => void | Promise<void>`): Called after the session starts. Attach event listeners or trigger replies here.

## `runLiveKitWorker()`

Starts the LiveKit worker CLI (`dev`, `start`, and `connect` subcommands) for a worker entry file. Call it from the file that default-exports the worker definition, guarded so it only runs when executed directly (the worker spawns a child process per session that re-imports the same file). Using this helper instead of `cli.runApp` from `@livekit/agents` guarantees the worker runtime and the bridge share one copy of the LiveKit SDK.

### Options

**entry** (`string | URL`): The worker entry module whose default export is the agent definition. Pass import.meta.url.

**agentName** (`string`): LiveKit agent name for explicit dispatch. (Default: `'mastra-voice'`)

**serverOptions** (`Partial<ServerOptions>`): Extra LiveKit ServerOptions merged over what this helper builds.

## `pipeAgentReplyToWriter()`

Streams a Mastra agent's reply into a workflow step's `writer` on the workflow reply path. It forwards the agent's text deltas, so text-to-speech starts before the full reply is ready, and its tool-call chunks, so `toolFeedback` fires and `onTurnComplete` sees the tool list. Piping only `stream.textStream` silently drops tool calls. Pass the step's `abortSignal` to `agent.stream()` so barge-in stops generation promptly.

```typescript
import { pipeAgentReplyToWriter } from '@mastra/livekit'

const generateResponse = createStep({
  id: 'generateResponse',
  // input and output schemas omitted
  execute: async ({ inputData, mastra, writer, abortSignal }) => {
    const stream = await mastra.getAgent('support').stream(inputData.turn, { abortSignal })
    const reply = await pipeAgentReplyToWriter(stream, writer)
    return { reply }
  },
})
```

Returns: `Promise<string>`, the accumulated reply text.

### Parameters

**agentStream** (`AgentReplyStreamLike`): The stream returned by agent.stream() — anything exposing a fullStream async iterable.

**writer** (`WritableStream<unknown>`): The workflow step's writer.

## `chatContextToMessages()`

Converts a LiveKit chat context into plain messages accepted by `agent.stream()`, excluding instructions and function calls. Use it in `workflowInput` to pass the full transcript into a stateless workflow.

```typescript
import { createLiveKitWorker, chatContextToMessages } from '@mastra/livekit/worker'

export default createLiveKitWorker({
  mastra,
  workflow: 'phoneConversation',
  workflowInput: ({ chatCtx }) => ({ history: chatContextToMessages(chatCtx) }),
})
```

Returns: `VoiceTurnMessage[]`, where each entry is `{ role: 'system' | 'user' | 'assistant'; content: string; id?: string }`.

## `MastraLLM`

A standard LiveKit LLM plugin (`llm.LLM`) backed by a Mastra agent. Use it when you build the `voice.AgentSession` yourself and want Mastra in the `llm` slot. [`createLiveKitWorker()`](#createlivekitworker) is the managed alternative. See [Use Mastra as the LLM component](https://mastra.ai/guides/voice/realtime-voice) for how to choose.

With `remote`, the plugin streams each turn from your Mastra server over HTTP using Server-Sent Events (SSE). The agent loop, tools, and memory run server-side, and interrupting the agent aborts the server-side generation.

```typescript
import { voice } from '@livekit/agents'
import { MastraLLM } from '@mastra/livekit/plugin'

const session = new voice.AgentSession({
  llm: new MastraLLM({
    remote: { baseUrl: process.env.MASTRA_URL!, agentId: 'support' },
    memory: { thread: callId, resource: userId },
  }),
  stt: 'deepgram/nova-3',
  tts: 'cartesia/sonic-3',
  // Required with `memory`: LiveKit enables preemptive generation by default.
  turnHandling: { preemptiveGeneration: { enabled: false } },
})
```

The plugin reports `provider` as `mastra` and `model` as the agent id, so LiveKit metrics and fallback adapters identify it like any other LLM.

### Constructor options

Provide exactly one reply source: `remote`, `agent`, or `generate`.

**remote** (`RemoteMastraAgentOptions`): Remote Mastra server reached over HTTP. Takes the same connection options as createRemoteAgentReplyGenerator(): baseUrl, agentId, apiPrefix, headers, fetch, timeoutMs, retries, body.

**agent** (`Agent`): In-process Mastra agent. Session ownership without a second deployment.

**generate** (`VoiceReplyGenerator`): Custom reply source. A generate source owns its own hooks; toolFeedback, onToolCall, and onTurnComplete below only apply to the remote and agent sources.

**memory** (`{ thread: string; resource?: string } | false`): Conversation persistence, resolved per call (for example from the SIP caller identity). When set, only messages new since the agent last spoke are sent each turn and Mastra Memory supplies history. When omitted, the full LiveKit chat context is sent every turn. (Default: `false`)

**requestContext** (`RequestContext | Record<string, unknown>`): Request context forwarded to generation (tenant, dialed number, and so on).

**toolFeedback** (`(toolCall: VoiceToolCall) => string | undefined`): Return a short phrase to speak while a server-side tool runs.

**onToolCall** (`(toolCall: VoiceToolCall) => void`): Called as each tool call starts, mid-stream. Pair with runEndCall() to implement your own agent-initiated hang-up flow.

**onTurnComplete** (`(ctx: VoiceTurnCompleteContext) => void | Promise<void>`): Called once per turn after the reply finished streaming, off the audio path and not awaited. The context carries the produced reply: text, toolCalls, interrupted, and usage.

> **Warning:** Don't combine `memory` with the session's `preemptiveGeneration` option, which LiveKit enables by default in sessions you build yourself. A speculative turn that completes before LiveKit discards it persists a user message and a never-spoken reply to the thread. Set `turnHandling: { preemptiveGeneration: { enabled: false } }` on the session. Stateless mode (no `memory`) works with preemptive generation.

### Tools run on the Mastra agent

Tools are defined and executed server-side on the Mastra agent. The plugin never forwards LiveKit tool definitions: if the session passes a non-empty `toolCtx`, it logs a one-time warning naming the ignored tools. Every tool must complete server-side: a tool that requires approval or client-side execution fails the turn with a descriptive error instead of hanging the call.

Tool activity reaches the worker through `toolFeedback`, `onToolCall`, and `onTurnComplete`.

### Instructions

LiveKit injects your `voice.Agent`'s `instructions` into the chat context of every request. The plugin drops them because the server-side Mastra agent's own instructions are authoritative. To change the prompt, change the Mastra agent.

### Interrupted turns

When the user interrupts a reply:

1. The plugin cancels the stream. The server aborts generation and persists nothing from that turn.
2. LiveKit records the part the user actually heard in its chat context, flagged as interrupted.
3. On the next turn, the plugin re-sends that heard-only fragment, ordered before the new user message, so the memory thread backfills to match the call. Messages carry LiveKit's message ids and the server deduplicates by id, so retries and re-sends stay idempotent.

A user who hangs up immediately after interrupting leaves that final fragment unrecorded. When the transcript must capture it, reconcile immediately from the session event; the shared message id means the next turn's re-send upserts instead of duplicating:

```typescript
import { voice } from '@livekit/agents'
import { MastraClient } from '@mastra/client-js'

const client = new MastraClient({ baseUrl: process.env.MASTRA_URL! })

session.on(voice.AgentSessionEventTypes.ConversationItemAdded, ({ item }) => {
  if (item.type !== 'message' || item.role !== 'assistant' || !item.interrupted) return
  void client.saveMessageToMemory({
    agentId: 'support',
    messages: [
      {
        id: item.id,
        threadId: callId,
        resourceId: userId,
        role: 'assistant',
        content: item.textContent ?? '',
        type: 'text',
        createdAt: new Date(),
      },
    ],
  })
})
```

### Usage metrics

When the server reports token usage for a turn, the plugin feeds it to LiveKit, so the session's `metrics_collected` events carry time-to-first-token, duration, and token counts like any LLM plugin. The same usage object (`promptTokens`, `completionTokens`, `promptCachedTokens`, `totalTokens`) arrives on `onTurnComplete` as `result.usage`.

### Errors and timeouts

The transport throws LiveKit's `APIError` types (`APIStatusError`, `APIConnectionError`, `APITimeoutError`), so the session's retry policy (`connOptions.maxRetry`) and `FallbackAdapter` failover work unchanged. A turn is never retried after its first token: a voice reply is better failed fast than replayed half-heard.

A connect and first-token watchdog uses the session's `connOptions.timeoutMs` (10 seconds by default), so a server that accepts the connection but never streams can't cause indefinite dead air.

If the Mastra server goes down mid-call, each reply attempt fails with a typed error after its retries, and LiveKit closes the session after several consecutive failed replies. Restore the server before that budget runs out and the call recovers on the next turn.

### Message content

Message extraction is text-only: image content is dropped, and audio content is included only through its transcript. Voice pipelines aren't affected, but items you inject into the chat context yourself must carry text.

## `createRemoteAgentReplyGenerator()`

Builds a reply generator that runs the agent loop on a **remote** Mastra server over HTTP/SSE. `MastraLLM`'s `remote` mode uses it internally. Use it directly through `createLiveKitWorker`'s `generate` option to run the batteries-included worker against a remote server:

```typescript
import { createLiveKitWorker, createRemoteAgentReplyGenerator } from '@mastra/livekit/worker'
import { mastra } from './index'

export default createLiveKitWorker({
  mastra, // local instance for logger and worker config; replies come from the remote server
  generate: createRemoteAgentReplyGenerator({
    baseUrl: process.env.MASTRA_URL!,
    agentId: 'support',
  }),
  memory: ({ metadata, roomName }) => ({ thread: metadata.threadId ?? roomName }),
  stt: 'deepgram/nova-3',
  tts: 'cartesia/sonic-3',
})
```

On the `generate` path the worker-level `toolFeedback` and `onTurnComplete` options don't apply, and the worker's end-call detection doesn't fire; pass the hooks to the generator instead.

Cancelling a turn (barge-in) tears down the HTTP request, which aborts generation on the server. Errors are thrown as LiveKit `APIError` types. The `retries` option applies only to initial connection attempts. A turn is never retried after its first chunk.

Returns: `VoiceReplyGenerator`.

### Options

**baseUrl** (`string`): Base URL of the remote Mastra server, for example https\://my-app.example.com.

**agentId** (`string`): The agent's registered key or id on the remote Mastra instance.

**apiPrefix** (`string`): Path prefix for the Mastra API. (Default: `'/api'`)

**headers** (`Record<string, string> | () => Record<string, string> | Promise<Record<string, string>>`): Static headers, or a resolver invoked per turn — for example to mint a fresh authorization token.

**fetch** (`typeof fetch`): Injectable fetch implementation for tests or proxies. (Default: `globalThis.fetch`)

**timeoutMs** (`number`): Connect and first-token timeout in milliseconds. When used through MastraLLM, defaults to the session's connOptions.timeoutMs instead. (Default: `10000`)

**retries** (`number`): Initial-connection retry attempts, before the first chunk only. When used through MastraLLM, the LiveKit session owns retries and this is forced to 0. (Default: `2`)

**body** (`Record<string, unknown>`): Extra fields merged into each stream request body.

**toolFeedback** (`(toolCall: VoiceToolCall) => string | undefined`): Return a short phrase to speak while a server-side tool runs.

**onToolCall** (`(toolCall: VoiceToolCall) => void`): Called as each tool call starts, mid-stream.

**onTurnComplete** (`(ctx: VoiceTurnCompleteContext) => void | Promise<void>`): Called once per turn after the reply finished streaming, off the audio path.

## `speakGreeting()`

Speaks an opening greeting on a session you own, honoring interruption and playout options. Returns the LiveKit `SpeechHandle`, or `undefined` when there's no greeting text. `createLiveKitWorker()` uses it internally for its `greeting` configuration.

```typescript
import { speakGreeting } from '@mastra/livekit/worker'

await speakGreeting(session, {
  text: "You've reached support. You're speaking with an AI assistant.",
  allowInterruptions: false,
  awaitPlayout: true,
})
```

### Parameters

**session** (`voice.AgentSession`): The session to speak on.

**greeting** (`{ text?: string; allowInterruptions?: boolean; awaitPlayout?: boolean }`): The greeting text and playout options. When awaitPlayout is true, the returned promise resolves after the greeting finished playing (or was interrupted).

## `waitForAgentDoneSpeaking()`

Resolves once the agent is no longer producing or playing a reply: its state has left `thinking` and `speaking`. Resolves immediately when the agent is already idle, and always resolves within `maxWaitMs` (30 seconds by default) as a safety cap. Use it before tearing a session down so closing words play out instead of being cut off.

```typescript
import { waitForAgentDoneSpeaking } from '@mastra/livekit/worker'

await waitForAgentDoneSpeaking(session)
```

## `runEndCall()`

Ends the call after the agent asks to hang up. It waits for the agent's closing words and speaks an optional final `message` without interruption. It then deletes the room and hangs up the caller, including SIP callers. The job shuts down with its registered callbacks.

Pair it with [`MastraLLM`](#mastrallm)'s `onToolCall` and an [end-call tool](#createendcalltool) on the server-side agent to rebuild agent-initiated hang-up on a session you own:

```typescript
import { MastraLLM } from '@mastra/livekit/plugin'
import { DEFAULT_END_CALL_TOOL, runEndCall } from '@mastra/livekit/worker'

let ending = false

const llm = new MastraLLM({
  remote: { baseUrl: process.env.MASTRA_URL!, agentId: 'support' },
  onToolCall: ({ toolName }) => {
    if (toolName !== DEFAULT_END_CALL_TOOL || ending) return
    ending = true
    void runEndCall(session, ctx, {}, console)
  },
})
```

The exported constants `DEFAULT_END_CALL_TOOL` (`'endCall'`), `DEFAULT_END_CALL_REASON`, and `DEFAULT_END_CALL_MAX_WAIT_MS` (30000) hold the defaults.

### Parameters

**session** (`voice.AgentSession`): The session whose agent is finishing its closing words.

**ctx** (`JobContext`): The LiveKit job context used to delete the room and shut down.

**config** (`{ message?: string; reason?: string; maxWaitMs?: number; drainMs?: number }`): Optional final message spoken before hang-up, the shutdown reason to record, the safety cap on waiting for closing words, and the post-playout drain (default 800ms) that lets audio buffered at the caller finish playing before the room is deleted — LiveKit's playout accounting is worker-local, so hanging up the instant it clears clips the goodbye.

**logger** (`{ warn: (message: string, ...args: unknown[]) => void }`): Receives warnings when teardown steps fail. Pass your logger or console.

## `createEndCallTool()`

Builds the Mastra tool an agent calls when it wants to end the call. The tool signals intent and can run optional bookkeeping. The worker performs the actual hang-up. The tool lives on the server-safe root entry. Add it to agents defined in server code.

```typescript
import { Agent } from '@mastra/core/agent'
import { createEndCallTool } from '@mastra/livekit'

const supportAgent = new Agent({
  id: 'support',
  name: 'Support',
  instructions:
    'Help the caller. When everything is wrapped up, say goodbye and call endCall as your final action.',
  model: 'openai/gpt-5-mini',
  tools: { endCall: createEndCallTool() },
})
```

With `createLiveKitWorker()`, set `configuration: { endCall: {} }` and the worker watches for the tool and hangs up. On a session you own, rebuild the hang-up with [`runEndCall()`](#runendcall).

### Options

**id** (`string`): Tool id the agent calls to end the call. Must match the name the worker watches for (the worker's configuration.endCall.tool, or your own onToolCall check). (Default: `'endCall'`)

**description** (`string`): Override the description the model sees when deciding to call the tool.

**onEndCall** (`(request: { reason?: string; resourceId?: string; threadId?: string }) => void | Promise<void>`): Bookkeeping hook called when the agent invokes the tool — record the reason or mark the call resolved. Runs inside the turn; keep it quick. It does not hang up the call.

## `liveKitConnectionRoute()`

Returns an [API route](https://mastra.ai/docs/server/custom-api-routes) that mints a LiveKit access token with the voice agent dispatched into the room. Frontends call it to join a session.

```typescript
import { Mastra } from '@mastra/core/mastra'
import { liveKitConnectionRoute } from '@mastra/livekit'

export const mastra = new Mastra({
  server: {
    apiRoutes: [liveKitConnectionRoute({ agentName: 'mastra-voice' })],
  },
})
```

The route accepts a JSON body with optional `agentId`, `threadId`, and `resourceId` fields and responds with `{ serverUrl, roomName, participantName, participantToken }`. The `threadId` defaults to the generated room name.

### Options

**path** (`string`): Route path. (Default: `'/voice/livekit/connection-details'`)

**serverUrl** (`string`): LiveKit server URL. (Default: `process.env.LIVEKIT_URL`)

**apiKey** (`string`): LiveKit API key. (Default: `process.env.LIVEKIT_API_KEY`)

**apiSecret** (`string`): LiveKit API secret. (Default: `process.env.LIVEKIT_API_SECRET`)

**agentName** (`string`): LiveKit agent name for explicit dispatch. Must match the worker's agentName. (Default: `'mastra-voice'`)

**ttl** (`string | number`): Token time-to-live. (Default: `'15m'`)

**requiresAuth** (`boolean`): Whether the route requires authentication. (Default: `true`)

**roomName** (`string | (args) => string`): Room name or a function that derives one from the request.

**participantIdentity** (`string | (args) => string`): Participant identity or a function that derives one from the request.

**metadata** (`(args) => LiveKitSessionMetadata | Promise<LiveKitSessionMetadata>`): Builds the session metadata delivered to the worker. Defaults to passing through agentId, threadId, and resourceId from the request body.

## `dispatchVoiceSession()`

Dispatches a Mastra voice agent into a LiveKit room programmatically: for server-initiated sessions such as outbound calls.

```typescript
import { dispatchVoiceSession } from '@mastra/livekit'

await dispatchVoiceSession({
  roomName: 'support-call-42',
  agentName: 'mastra-voice',
  metadata: { agentId: 'support', threadId: 'thread-42' },
})
```

### Options

**roomName** (`string`): Room to dispatch the agent into. Created on demand.

**agentName** (`string`): Must match the worker's agentName. (Default: `'mastra-voice'`)

**metadata** (`LiveKitSessionMetadata`): Session metadata: agentId, threadId, resourceId, requestContext.

**serverUrl** (`string`): LiveKit server URL. (Default: `process.env.LIVEKIT_URL`)

**apiKey** (`string`): LiveKit API key. (Default: `process.env.LIVEKIT_API_KEY`)

**apiSecret** (`string`): LiveKit API secret. (Default: `process.env.LIVEKIT_API_SECRET`)

## `LiveKitSessionMetadata`

The metadata passed from the Mastra server to the worker through LiveKit job dispatch.

**agentId** (`string`): Mastra agent to run, by registered key or agent id.

**threadId** (`string`): Memory thread id. Defaults to the LiveKit room name.

**resourceId** (`string`): Memory resource id, typically the end user id.

**requestContext** (`Record<string, unknown>`): Plain-object entries restored into a RequestContext for agent execution.

The metadata travels as a JSON string. `liveKitConnectionRoute()` and `dispatchVoiceSession()` serialize it for you; use `serializeSessionMetadata(metadata)` when dispatching through your own code, or write the JSON directly in LiveKit-side configuration such as a SIP dispatch rule. Entries in `requestContext` reach the agent's runtime-defined instructions, tools, and input processors on every turn of the call.

## Related

- [Realtime voice](https://mastra.ai/guides/voice/realtime-voice)
- [LiveKit Agents docs](https://docs.livekit.io/agents/)