> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# xAI Realtime voice

The `XAIRealtimeVoice` class provides realtime voice interaction capabilities using the xAI Grok Voice Agent API. It implements Mastra's `MastraVoice` realtime contract and supports bidirectional audio streaming, text turns, server VAD, xAI voices, function tools, and xAI server-side tools.

## Usage example

```typescript
import { Agent } from '@mastra/core/agent'
import { getMicrophoneStream, playAudio } from '@mastra/node-audio'
import { XAIRealtimeVoice } from '@mastra/voice-xai-realtime'

const voice = new XAIRealtimeVoice({
  apiKey: process.env.XAI_API_KEY,
  model: 'grok-voice-think-fast-1.0',
  speaker: 'eve',
  instructions: 'You are a concise voice assistant.',
  turnDetection: { type: 'server_vad' },
})

const agent = new Agent({
  id: 'voice-agent',
  name: 'Voice Agent',
  instructions: 'You are a helpful voice assistant.',
  model: 'xai/grok-4.3',
  voice,
})

await agent.voice.connect()

agent.voice.on('speaker', audioStream => {
  playAudio(audioStream)
})

agent.voice.on('writing', ({ text, role }) => {
  console.log(`${role}: ${text}`)
})

await agent.voice.speak('How can I help you today?')

const microphoneStream = getMicrophoneStream()
await agent.voice.send(microphoneStream)

agent.voice.close()
```

## Configuration

### Constructor options

**apiKey** (`string`): xAI API key. Falls back to the XAI\_API\_KEY environment variable.

**ephemeralToken** (`string`): Short-lived xAI token sent with the WebSocket protocol instead of an authorization header.

**model** (`XAIRealtimeModel`): The Grok voice model to use. (Default: `'grok-voice-think-fast-1.0'`)

**speaker** (`XAIVoice`): Voice ID to use for speech output. Built-in values are eve, ara, rex, sal, and leo. Custom xAI voice IDs are also supported. (Default: `'eve'`)

**instructions** (`string`): System instructions sent in session.update.

**turnDetection** (`XAITurnDetection`): Voice activity detection configuration. (Default: `{ type: 'server_vad' }`)

**audio** (`XAIAudioConfig`): Input and output audio format configuration. (Default: `24 kHz audio/pcm input and output`)

**serverTools** (`XAIServerTool[]`): xAI server-side tools to send in session.update. Supports file\_search, web\_search, x\_search, and mcp. These are merged with session.tools.

**session** (`Partial<XAISessionConfig>`): Additional xAI session fields to merge into the initial session.update event.

**url** (`string`): Override the xAI realtime WebSocket URL. (Default: `'wss://api.x.ai/v1/realtime'`)

**debug** (`boolean`): Enable debug logging for received xAI events. Debug logs can include transcripts and tool-call arguments. (Default: `false`)

### VoiceConfig pattern

You can also use Mastra's shared voice configuration shape:

```typescript
const voice = new XAIRealtimeVoice({
  speaker: 'ara',
  realtimeConfig: {
    model: 'grok-voice-think-fast-1.0',
    apiKey: process.env.XAI_API_KEY,
    options: {
      instructions: 'Answer briefly.',
      turnDetection: { type: 'server_vad', threshold: 0.85 },
    },
  },
})
```

## Authentication

Use `apiKey` or `XAI_API_KEY` for server-side applications. This provider is built for Node.js server-side runtimes. If you already mint xAI ephemeral tokens on your server, you can pass one as `ephemeralToken`; the provider uses the `xai-client-secret.<token>` WebSocket protocol instead of an authorization header. If both `apiKey` and `ephemeralToken` are configured, the provider uses the ephemeral token.

## Methods

### `connect()`

Establishes the WebSocket connection and sends the initial `session.update`.

**requestContext** (`RequestContext`): Optional Mastra request context passed to function tool executions.

Returns: `Promise<void>`

### `close()`

Closes the WebSocket connection, ends active speaker streams, and clears queued events, pending function-call state, and request context. `disconnect()` is an alias for `close()`.

Returns: `void`

### `addInstructions()`

Sets session instructions. If the WebSocket is open, the provider sends a `session.update`. Passing `undefined` stores an empty string and clears the active instructions on the current session or the next connection.

**instructions** (`string`): System instructions to send to xAI.

Returns: `void`

### `addTools()`

Registers Mastra function tools and, when connected, refreshes the session tools with `session.update`.

**tools** (`ToolsInput`): Mastra tools to expose as xAI function tools.

Returns: `void`

### `updateConfig()`

Sends a `session.update` event with additional xAI session fields.

**sessionConfig** (`Partial<XAISessionConfig>`): Session fields to update.

Returns: `void`

### `speak()`

Sends a text turn using `conversation.item.create` and then requests a response.

**input** (`string | NodeJS.ReadableStream`): Text or a readable text stream to send as user input.

**options.speaker** (`XAIVoice`): Voice override. This updates the active xAI session voice and is used for subsequent turns.

**options.response** (`Record<string, unknown>`): Additional xAI response.create fields.

Returns: `Promise<void>`

### `send()`

Streams realtime audio chunks with `input_audio_buffer.append`.

`send()` requires an open connection. Use it for live microphone audio after `connect()` resolves. Readable stream chunks must be binary audio chunks (`Buffer`, `ArrayBuffer`, or a typed array).

**audioData** (`NodeJS.ReadableStream | Int16Array`): PCM audio stream or Int16Array audio data.

**eventId** (`string`): Optional xAI event ID.

Returns: `Promise<void>`

### `listen()`

Sends a finite audio stream with `input_audio_buffer.append`. By default it commits the input buffer and requests a response.

**audioData** (`NodeJS.ReadableStream`): Audio stream to send.

**options.commit** (`boolean`): Whether to send input\_audio\_buffer.commit after the audio item. (Default: `true`)

**options.createResponse** (`boolean`): Whether to send response.create after the audio item. (Default: `true`)

Returns: `Promise<void>`

### `answer()`

Sends `response.create` to ask xAI to continue the conversation.

Returns: `Promise<void>`

### `commitAudioBuffer()` and `clearAudioBuffer()`

Send the matching xAI realtime client events for manual turn control.

Returns: `Promise<void>`

### `cancelResponse()`

Sends `response.cancel` to interrupt an in-flight response.

**responseId** (`string`): Optional xAI response ID to cancel.

**eventId** (`string`): Optional xAI event ID.

Returns: `Promise<void>`

## Events

`XAIRealtimeVoice` maps xAI realtime server events onto Mastra voice events:

- `speaker`: emits a readable stream for assistant audio.
- `speaking`: emits assistant audio deltas.
- `speaking.done`: emits when an assistant audio response completes.
- `writing`: emits assistant text deltas and user input transcriptions.
- `error`: emits xAI and provider execution errors. It also emits tool execution errors, and malformed function-call arguments. Tool errors include `details.call_id` and `details.name`.
- `close`: emits when the WebSocket closes.
- `tool-call-start`: emits before a Mastra function tool is executed.
- `tool-call-result`: emits after a Mastra function tool returns.

Raw xAI event names are also emitted, so you can subscribe to events such as `response.output_audio.delta`, `response.text.delta`, `response.function_call_arguments.done`, and `response.done`.

## Tools

### Mastra function tools

Tools added with `addTools()` are converted into xAI function tools and included in `session.update`.

```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const weatherTool = createTool({
  id: 'getWeather',
  description: 'Get current weather for a location.',
  inputSchema: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    return { location, temperature: 22 }
  },
})

voice.addTools({ getWeather: weatherTool })
```

When xAI emits `response.function_call_arguments.done`, the provider executes the matching Mastra tool and sends a `function_call_output` item. If xAI emits multiple function calls for one response, the provider waits for every tool result and the response's `response.done` event before sending one continuation `response.create`.

### xAI server-side tools

xAI server-side tools are passed through in the session configuration and executed by xAI. Tools passed in `session.tools` and `serverTools` are merged:

```typescript
const voice = new XAIRealtimeVoice({
  apiKey: process.env.XAI_API_KEY,
  serverTools: [
    { type: 'web_search' },
    { type: 'x_search', allowed_x_handles: ['xai'] },
    { type: 'file_search', vector_store_ids: ['collection_123'], max_num_results: 10 },
    {
      type: 'mcp',
      server_url: 'https://mcp.example.com/mcp',
      server_label: 'business-tools',
      allowed_tools: ['lookup_order'],
    },
  ],
})
```

## Audio formats

The default input and output format is 24 kHz PCM16. You can also configure supported PCM sample rates or telephony codecs:

```typescript
const voice = new XAIRealtimeVoice({
  audio: {
    input: { format: { type: 'audio/pcm', rate: 16000 } },
    output: { format: { type: 'audio/pcm', rate: 16000 } },
  },
})
```

Supported format types are `audio/pcm`, `audio/pcmu`, and `audio/pcma`. PCM supports the documented sample rates from 8 kHz through 48 kHz. `audio/pcmu` and `audio/pcma` are G.711 telephony codecs and use 8 kHz.