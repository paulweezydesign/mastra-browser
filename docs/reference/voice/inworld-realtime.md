> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Inworld Realtime voice

The `InworldRealtimeVoice` class provides real-time, full-duplex voice interaction using [Inworld AI's Realtime API](https://docs.inworld.ai/realtime/quickstart-websocket) over WebSockets. It supports speech-to-speech, tool calling, and Inworld-specific session knobs such as semantic voice activity detection, MCP tool routing, and playback speed.

Inworld's wire protocol is the OpenAI Realtime GA spec, so client and server event names match `@mastra/voice-openai-realtime`. The provider-level differences are the endpoint (which uses a client-generated session key in the URL), the `Authorization: Basic <key>` header, the typed `session` constructor field for Inworld-specific knobs, and a typed `providerData` object for Inworld extensions (STT, TTS, memory, back-channel, responsiveness) sent under `session.providerData`.

For batch text-to-speech and speech-to-text, see [`@mastra/voice-inworld`](https://mastra.ai/reference/voice/inworld).

## Usage example

```typescript
import { InworldRealtimeVoice } from '@mastra/voice-inworld'
import { playAudio, getMicrophoneStream } from '@mastra/node-audio'

// Initialize with INWORLD_API_KEY from the environment
const voice = new InworldRealtimeVoice()

// Or initialize with explicit configuration
const voiceWithConfig = new InworldRealtimeVoice({
  apiKey: 'your-inworld-api-key',
  model: 'inworld/models/gemma-4-26b-a4b-it',
  speaker: 'Sarah',
  instructions: 'You are a helpful voice assistant.',
  session: {
    audio: {
      output: { speed: 1.1 },
      input: { turn_detection: { type: 'semantic_vad', eagerness: 'high' } },
    },
  },
})

// Establish connection
await voice.connect()

// Listen for audio output (PCM16 @ 24 kHz by default)
voice.on('speaker', stream => {
  playAudio(stream)
})

voice.on('writing', ({ text, role }) => {
  console.log(`${role}: ${text}`)
})

// Convert text to speech
await voice.speak('Hello, how can I help you today?', {
  speaker: 'Hades',
})

// Stream microphone audio to the model
const microphoneStream = getMicrophoneStream()
await voice.send(microphoneStream)

// Clean up
voice.close()
```

> Inworld API keys are pre-Basic-encoded. Paste them verbatim into `INWORLD_API_KEY`. The package doesn't re-encode them.

## Constructor parameters

**apiKey** (`string`): Inworld API key. Falls back to the INWORLD\_API\_KEY environment variable. Keys are Basic-encoded and passed verbatim in the Authorization header.

**url** (`string`): Realtime WebSocket endpoint. A client-generated session key and protocol parameter are appended automatically. (Default: `'wss://api.inworld.ai/api/v1/realtime/session'`)

**model** (`string`): LLM Router model ID. Sent via the initial session.update, not in the URL. Any model supported by Inworld's router is accepted. (Default: `'inworld/models/gemma-4-26b-a4b-it'`)

**speaker** (`string`): Default voice ID for speech synthesis. Any voice from Inworld's catalog is accepted. (Default: `'Sarah'`)

**sessionId** (`string`): Client-generated session key surfaced as the URL key parameter. A timestamp-based key is generated automatically when omitted. (Default: `'voice-{Date.now()}'`)

**instructions** (`string`): System prompt sent with the initial session.update.

**session** (`Partial<InworldSessionConfig>`): Typed first-class session options (audio, tool\_choice, output\_modalities, temperature, ...). Deep-merged into every session.update so nested fields like audio.output.voice and audio.output.speed compose rather than overwrite each other. See the session field below.

**debug** (`boolean`): Log raw server events. (Default: `false`)

**providerData** (`InworldProviderData`): Typed Inworld extension config (stt, tts, memory, backchannel, responsiveness, plus user\_id and metadata). Sent under session.providerData on every session.update. Composes with any session.providerData set via the session field; the constructor option wins on key collisions.

**connectTimeoutMs** (`number`): Max time connect() will wait for both the WebSocket handshake and the initial session.updated round-trip. A pre-open error or close on the WebSocket — or this timeout expiring — surfaces as a rejected promise instead of an uncaught socket error. (Default: `15000`)

### `session` (typed knobs)

Use the typed `session` field for documented Inworld realtime options. Fields compose with the connect-time defaults (e.g. `audio.output.voice` set from `speaker`):

**output\_modalities** (`Array<"text" | "audio">`): Modalities the model should produce.

**audio.output.voice** (`string`): Voice catalog ID. When omitted, the constructor speaker is used.

**audio.output.speed** (`number`): Playback speed multiplier for synthesized audio (0.25 to 1.5).

**audio.output.model** (`string`): Inworld TTS model (e.g. "inworld-tts-2").

**audio.output.format** (`InworldAudioFormat`): Output audio encoding. A codec string (e.g. "audio/pcm", "audio/pcmu", "audio/pcma", "audio/float32") or an object { type, rate? }. rate (Hz) applies to audio/pcm and audio/float32 (default 24000); audio/pcmu and audio/pcma are fixed at 8 kHz.

**audio.input.format** (`InworldAudioFormat`): Input audio encoding sent to the server. Same shape as audio.output.format — a codec string or { type, rate? } object.

**audio.input.noise\_reduction** (`{ type: "near_field" | "far_field" }`): Input noise-reduction mode applied before transcription and VAD.

**audio.input.transcription** (`{ model?: string; language?: string; prompt?: string }`): Server-side transcription for incoming user audio. Defaults to { model: "inworld/inworld-stt-1" }. prompt biases transcription with vocabulary, spelling, or style hints. Supply your own object to override; set to null to disable user-side transcription.

**audio.input.turn\_detection** (`InworldTurnDetection | null`): Voice activity / turn detection. Defaults to { type: "semantic\_vad", eagerness: "medium", create\_response: true, interrupt\_response: true }. Supply your own object to override; set to null to disable turn detection entirely. The eagerness field controls how quickly semantic VAD ends a user turn — low waits for clearer pauses (more interruption-resistant), high ends turns sooner (snappier, more prone to cutting users off). Default medium balances both. idle\_timeout\_ms (server\_vad only) sets the idle window before the server commits a turn.

**tool\_choice** (`string | { type: "function"; name: string } | { type: "mcp"; server_label: string }`): Tool selection strategy. Use the mcp variant to route tool calls through a configured Inworld MCP server.

**temperature** (`number`): Sampling temperature for the model.

**max\_output\_tokens** (`number | "inf"`): Maximum tokens generated per response.

**truncation** (`"auto" | "disabled" | { type: "retention_ratio"; retention_ratio: number }`): Conversation truncation strategy.

**tracing** (`"auto" | { workflow_name?: string; group_id?: string; metadata?: Record<string, unknown> }`): Distributed-tracing config. Use "auto" for server defaults, or name the workflow/group explicitly.

**include** (`Array<"item.input_audio_transcription.logprobs">`): Opt-in extra fields the server should include on emitted events.

**prompt** (`string | null`): Reference to a server-side prompt template. Pass null to clear it.

### `providerData` (Inworld extensions)

`providerData` is a typed object for Inworld-specific realtime extensions. It's sent under `session.providerData` on every `session.update`, and composes with any `session.providerData` you set via the `session` field: the constructor `providerData` wins on key collisions.

It has five branches plus two session-level fields:

- `stt`: STT tuning, such as `prompt`, `voice_profile`, `language_hints`, and VAD or end-of-turn thresholds.
- `tts`: TTS segmentation and delivery, such as `segmenter_strategy`, `steering_handling`, `delivery_mode`, `conversational`, and `user_turn_mode`.
- `memory`: automatic rolling memory, such as `enabled`, `turn_interval`, and `max_facts`. Inworld echoes its state back through the `memory` event.
- `backchannel`: short acknowledgements ("uh-huh") while the user speaks. Audio arrives on the `backchannel` event.
- `responsiveness`: early filler audio while the main response generates. Filler audio reuses the normal `speaker` and `speaking` events, so there are no distinct events.
- `user_id` and `metadata`: session-level identifiers passed through to Inworld.

```typescript
const voice = new InworldRealtimeVoice({
  providerData: {
    stt: { voice_profile: true, language_hints: ['en-US'] },
    tts: { delivery_mode: 'CREATIVE', segmenter_strategy: 'balanced' },
    memory: { enabled: true, turn_interval: 4 },
    backchannel: { enabled: true, max_per_turn: 1 },
    user_id: 'user-123',
  },
})
```

## Methods

### `connect()`

Opens the WebSocket connection, sends the initial `session.update`, and resolves once the server acknowledges with `session.updated`. Must be called before `speak()`, `listen()`, or `send()`.

A pre-open `error` or `close` on the WebSocket (or a handshake that exceeds `connectTimeoutMs` (15s default)) surfaces as a rejected promise instead of an uncaught socket error. On reject, the half-open socket is closed.

```typescript
await voice.connect()
```

Returns: `Promise<void>`

### `speak()`

Sends a text message to the model and triggers an audio response. The returned promise resolves only after the full response lifecycle completes (`response.done` for the response this call triggered), and rejects if the response is interrupted by user speech or if a transport error occurs.

Serial `speak()` calls are the supported pattern. Concurrent calls share the same listener pool and have undefined response-pinning order.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to convert to speech.

**options** (`Options`): Per-call configuration.

**options.speaker** (`string`): Voice ID to use for this specific request.

Returns: `Promise<void>`

### `listen()`

Sends a single audio buffer as a user turn and asks the model to respond with text only.

**audioData** (`NodeJS.ReadableStream`): Audio stream to transcribe.

Returns: `Promise<void>`

### `send()`

Streams audio data to the server in real time. Useful for continuous microphone input.

**audioData** (`NodeJS.ReadableStream | Int16Array`): Audio data to stream. Int16Array is sent as a single base64 chunk; a readable stream is forwarded chunk by chunk.

**eventId** (`string`): Optional event ID forwarded to the server with each audio chunk.

Returns: `Promise<void>`

### `updateConfig()`

Sends a `session.update` to the server. The typed `session` field is deep-merged into the payload, and any constructor `providerData` is nested under `session.providerData`.

**sessionConfig** (`InworldSessionConfig | Record<string, unknown>`): Partial session configuration to apply.

Returns: `void`

### `addInstructions()`

Sets the system instructions used on the next `connect()` or `updateConfig()` call.

**instructions** (`string`): System prompt for the model.

Returns: `void`

### `addTools()`

Registers tools that the model can call during the session. When `InworldRealtimeVoice` is attached to an Agent, tools configured for the Agent are made available automatically.

**tools** (`ToolsInput`): Tools configuration to equip.

Returns: `void`

### `answer()`

Sends a `response.create` event to trigger a model response, optionally with per-response options.

**options** (`Record<string, unknown>`): Response options forwarded to the server.

Returns: `Promise<void>`

### Turn-taking

#### `commitInput()`

Manually commits buffered input audio as a user turn. Use this for push-to-talk or manual turn-taking when `turn_detection` is set to `null`.

```typescript
voice.commitInput()
```

Returns: `void`

#### `clearInput()`

Discards buffered input audio without committing it as a user turn.

```typescript
voice.clearInput()
```

Returns: `void`

#### `clearOutput()`

Clears the server's entire output audio buffer, stopping playback. This also stops any in-flight back-channel audio. The default barge-in path (`response.cancel` on `interrupted`) is back-channel-safe. Prefer it. Use `clearOutput()` only when you want to flush everything.

```typescript
voice.clearOutput()
```

Returns: `void`

### `close()` and `disconnect()`

Both methods close the WebSocket and mark the instance as disconnected.

Returns: `void`

### `getSpeakers()`

Returns the curated voice list bundled with the package. Inworld's catalog is larger than this list; any voice ID can be passed to `speaker` at runtime.

Returns: `Promise<Array<{ voiceId: string }>>`

### `on()` and `off()`

Register and remove event listeners. See [Events](#events) below.

## Events

The `InworldRealtimeVoice` class emits the following events:

**speaker** (`event`): Emitted once per response with a PassThrough stream of PCM audio. Use this when piping audio to a player.

**speaking** (`event`): Emitted for each audio delta. Callback receives { audio: Buffer, response\_id: string }.

**speaking.done** (`event`): Emitted when audio output for a response is complete. Callback receives { response\_id: string }.

**writing** (`event`): Emitted as transcribed text becomes available. Callback receives { text: string, response\_id: string, role: "assistant" | "user", voiceProfile? }. Deduplicated across audio-transcript and text deltas in the same response so a single response only emits one stream. On user events, voiceProfile is present when providerData.stt.voice\_profile is enabled.

**speech-started** (`event`): Raw input\_audio\_buffer.speech\_started VAD edge from the server.

**speech-stopped** (`event`): Raw input\_audio\_buffer.speech\_stopped VAD edge from the server.

**interrupted** (`event`): Synthetic client-side signal: emitted once per in-flight response\_id when the user starts speaking. Use this to stop main response playback on barge-in. Callback receives { response\_id: string }. Only carries main-response ids — never back-channel ids — so stopping the matching speaker stream leaves backchannel streams playing (back-channels are meant to overlap user speech and are never cancelled by barge-in).

**turn-suggestion** (`event`): Smart-turn endpointing hint for a buffered user utterance. Callback receives { item\_id, utterance\_index, probability, trailing\_silence\_ms?, audio\_duration\_ms?, inference\_ms? }.

**turn-suggestion-revoked** (`event`): A previously emitted turn suggestion was retracted. Callback receives { item\_id, utterance\_index }.

**input-committed** (`event`): Buffered input audio was committed as a user turn (via commitInput() or auto-VAD). Callback receives { item\_id, previous\_item\_id? } where previous\_item\_id may be null.

**input-cleared** (`event`): Buffered input audio was discarded (via clearInput()). Callback receives {}.

**input-timeout** (`event`): A server-VAD idle timeout committed a user turn. Callback receives { audio\_start\_ms, audio\_end\_ms, item\_id }.

**output-audio-started** (`event`): Server began emitting output audio. Callback receives {}.

**output-audio-stopped** (`event`): Server stopped emitting output audio for the current response. Callback receives {}.

**output-audio-cleared** (`event`): Server output audio buffer was flushed, stopping playback (via clearOutput()). Callback receives {}.

**memory** (`event`): Emitted with Inworld's rolling summary and facts state, deduplicated by version. Requires providerData.memory.enabled. Callback receives InworldMemoryState.

**backchannel** (`event`): Emitted with a PassThrough stream of back-channel PCM audio (short acknowledgements while the user speaks). Each stream's .id is a backchannel\_id that never appears in interrupted, so play these on a separate track that barge-in does not stop. Requires providerData.backchannel.enabled.

**backchannel.done** (`event`): Emitted when a back-channel finishes. Callback receives { backchannel\_id: string, phrase? }.

**backchannel.skipped** (`event`): Emitted when the decider skips a back-channel before any audio is produced. Callback receives { reason: string }.

**response.created** (`event`): Emitted when a new response begins. Callback receives the full server event.

**response.done** (`event`): Emitted when a response completes. Callback receives the full server event.

**conversation.item.added** (`event`): Emitted when a new conversation item is appended.

**conversation.item.done** (`event`): Emitted when a conversation item finishes.

**function\_call.arguments** (`event`): Emitted with complete tool call arguments. Callback receives { call\_id, name, arguments }.

**tool-call-start** (`event`): Emitted before a registered tool is executed.

**tool-call-result** (`event`): Emitted after a registered tool returns.

**error** (`event`): Emitted on transport or server errors.

## Voices

The package includes a curated set of voice IDs returned from `getSpeakers()`:

- `Dennis`
- `Hades`
- `Wendy`
- `Edward`
- `Olivia`
- `Sarah`
- `Timothy`
- `Priya`
- `Ronald`
- `Deborah`

Any voice ID from [Inworld's voice catalog](https://docs.inworld.ai/quickstart-tts) can be passed to `speaker` at runtime.

## Notes

- API keys can be provided via constructor options or the `INWORLD_API_KEY` environment variable. Keys are pre-Basic-encoded. Don't re-encode them.
- The WebSocket URL appends `?key=<sessionId>&protocol=realtime`. The model is configured via the initial `session.update`, not the URL.
- Per-call `speak(input, { speaker })` scopes the voice override to a single response (via the flat `response.voice` field) and doesn't mutate the session.
- Audio output defaults to PCM16 at 24 kHz. Telephony `audio/pcmu` and `audio/pcma` at 8 kHz, and `audio/float32`, are also supported via `session.audio.output.format`.
- Use `connect()` before any send, speak, or listen call. Events sent before the WebSocket is open are queued and flushed once the server acknowledges `session.updated`.
- The voice instance must be closed with `close()` or `disconnect()` to release the WebSocket.
- `audio.input.turn_detection` defaults to semantic VAD when `session` doesn't supply it. Override with your own object, or pass `null` to disable turn detection entirely.
- `audio.input.transcription` defaults to `{ model: 'inworld/inworld-stt-1' }`, so user-side `writing` events fire out of the box. Override with your own object, or pass `null` to disable user-side transcription.
- `on()` and `off()` are typed against `InworldVoiceEventMap`. Known event names yield a typed callback payload. Unknown names fall back to `unknown`.