> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Google Gemini Live voice

The GeminiLiveVoice class provides real-time voice interaction capabilities using Google's Gemini Live API. It supports bidirectional audio streaming, tool calling, session management, and both standard Google API and Vertex AI authentication methods.

## Usage example

```typescript
import { GeminiLiveVoice } from '@mastra/voice-google-gemini-live'
import { playAudio, getMicrophoneStream } from '@mastra/node-audio'

// Initialize with Gemini API (using API key)
const voice = new GeminiLiveVoice({
  apiKey: process.env.GOOGLE_API_KEY, // Required for Gemini API
  model: 'gemini-2.0-flash-exp',
  speaker: 'Puck', // Default voice
  debug: true,
})

// Or initialize with Vertex AI (using OAuth)
const voiceWithVertexAI = new GeminiLiveVoice({
  vertexAI: true,
  project: 'your-gcp-project',
  location: 'us-central1',
  serviceAccountKeyFile: '/path/to/service-account.json',
  model: 'gemini-2.0-flash-exp',
  speaker: 'Puck',
})

// Or use the VoiceConfig pattern (recommended for consistency with other providers)
const voiceWithConfig = new GeminiLiveVoice({
  speechModel: {
    name: 'gemini-2.0-flash-exp',
    apiKey: process.env.GOOGLE_API_KEY,
  },
  speaker: 'Puck',
  realtimeConfig: {
    model: 'gemini-2.0-flash-exp',
    apiKey: process.env.GOOGLE_API_KEY,
    options: {
      debug: true,
      sessionConfig: {
        interrupts: { enabled: true },
      },
    },
  },
})

// Establish connection (required before using other methods)
await voice.connect()

// Set up event listeners
voice.on('speaker', audioStream => {
  // Handle audio stream (NodeJS.ReadableStream)
  playAudio(audioStream)
})

voice.on('writing', ({ text, role }) => {
  // Handle transcribed text
  console.log(`${role}: ${text}`)
})

voice.on('turnComplete', ({ timestamp }) => {
  // Handle turn completion
  console.log('Turn completed at:', timestamp)
})

// Convert text to speech
await voice.speak('Hello, how can I help you today?', {
  speaker: 'Charon', // Override default voice
  responseModalities: ['AUDIO', 'TEXT'],
})

// Process audio input
const microphoneStream = getMicrophoneStream()
await voice.send(microphoneStream)

// Update session configuration
await voice.updateSessionConfig({
  speaker: 'Kore',
  instructions: 'Be more concise in your responses',
})

// When done, disconnect
await voice.disconnect()
// Or use the synchronous wrapper
voice.close()
```

## Configuration

### Constructor options

**apiKey** (`string`): Google API key for Gemini API authentication. Required unless using Vertex AI.

**model** (`GeminiVoiceModel`): The model ID to use for real-time voice interactions. (Default: `'gemini-2.0-flash-exp'`)

**speaker** (`GeminiVoiceName`): Default voice ID for speech synthesis. (Default: `'Puck'`)

**vertexAI** (`boolean`): Use Vertex AI instead of Gemini API for authentication. (Default: `false`)

**project** (`string`): Google Cloud project ID (required for Vertex AI).

**location** (`string`): Google Cloud region for Vertex AI. (Default: `'us-central1'`)

**serviceAccountKeyFile** (`string`): Path to service account JSON key file for Vertex AI authentication.

**serviceAccountEmail** (`string`): Service account email for impersonation (alternative to key file).

**instructions** (`string`): System instructions for the model.

**sessionConfig** (`GeminiSessionConfig`): Session configuration including interrupt and context settings.

**sessionConfig.interrupts** (`object`): Interrupt handling configuration.

**sessionConfig.interrupts.enabled** (`boolean`): Enable interrupt handling.

**sessionConfig.interrupts.allowUserInterruption** (`boolean`): Allow user to interrupt model responses.

**sessionConfig.contextCompression** (`boolean`): Enable automatic context compression.

**debug** (`boolean`): Enable debug logging for troubleshooting. (Default: `false`)

## Methods

### `connect()`

Establishes a connection to the Gemini Live API. Must be called before using speak, listen, or send methods.

**requestContext** (`object`): Optional request context for the connection.

**returns** (`Promise<void>`): Promise that resolves when the connection is established.

### `speak()`

Converts text to speech and sends it to the model. Can accept either a string or a readable stream as input.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to convert to speech.

**options** (`GeminiLiveVoiceOptions`): Optional speech configuration.

**options.speaker** (`GeminiVoiceName`): Voice ID to use for this specific speech request.

**options.languageCode** (`string`): Language code for the response.

**options.responseModalities** (`('AUDIO' | 'TEXT')[]`): Response modalities to receive from the model.

Returns: `Promise<void>` (responses are emitted via `speaker` and `writing` events)

### `sendContext()`

Sends conversation history into the live session without triggering a model response. Use this to seed prior turns (e.g. from Mastra Memory) on a cold connect so the model has context before the user speaks.

```typescript
await voice.sendContext([
  { role: 'user', content: 'What is the weather?' },
  { role: 'assistant', content: 'It is 72°F in San Francisco.' },
])

// Model stays silent until the user actually speaks.
await voice.send(micStream)
```

**turns** (`IncrementalTurn[]`): Prior conversation turns to seed into the session. Each turn has a role ("user" or "assistant") and content string. Both roles are supported on newer models (e.g. gemini-2.5-flash-native-audio-preview-12-2025). Some older models only accept user-role turns.

**options** (`object`): Optional configuration.

**options.turnComplete** (`boolean`): Whether to mark the turn as complete and trigger a model response.

Returns: `Promise<void>`

### `listen()`

Processes audio input for speech recognition. Takes a readable stream of audio data and returns the transcribed text.

**audioStream** (`NodeJS.ReadableStream`): Audio stream to transcribe.

**options** (`GeminiLiveVoiceOptions`): Optional listening configuration.

Returns: `Promise<string>` - The transcribed text

### `send()`

Streams audio data in real-time to the Gemini service for continuous audio streaming scenarios like live microphone input.

**audioData** (`NodeJS.ReadableStream | Int16Array`): Audio stream or buffer to send to the service.

Returns: `Promise<void>`

### `updateSessionConfig()`

Updates the session configuration at runtime. This can modify voice settings and speaker selection. It can also modify other runtime configurations.

**config** (`Partial<GeminiLiveVoiceConfig>`): Configuration updates to apply.

Returns: `Promise<void>`

### `addTools()`

Adds a set of tools to the voice instance. Tools allow the model to perform additional actions during conversations. When GeminiLiveVoice is added to an Agent, any tools configured for the Agent will automatically be available to the voice interface.

**tools** (`ToolsInput`): Tools configuration to equip.

Returns: `void`

### `addInstructions()`

Adds or updates system instructions for the model.

**instructions** (`string`): System instructions to set.

Returns: `void`

### `answer()`

Triggers a response from the model. This method is primarily used internally when integrated with an Agent.

**options** (`Record<string, unknown>`): Optional parameters for the answer request.

Returns: `Promise<void>`

### `getSpeakers()`

Returns a list of available voice speakers for the Gemini Live API.

Returns: `Promise<Array<{ voiceId: string; description?: string }>>`

### `disconnect()`

Disconnects from the Gemini Live session and cleans up resources. This is the async method that properly handles cleanup.

Returns: `Promise<void>`

### `close()`

Synchronous wrapper for disconnect(). Calls disconnect() internally without awaiting.

Returns: `void`

### `on()`

Registers an event listener for voice events.

**event** (`string`): Name of the event to listen for.

**callback** (`Function`): Function to call when the event occurs.

Returns: `void`

### `off()`

Removes a previously registered event listener.

**event** (`string`): Name of the event to stop listening to.

**callback** (`Function`): The specific callback function to remove.

Returns: `void`

## Events

The GeminiLiveVoice class emits the following events:

**speaker** (`event`): Emitted when audio data is received from the model. Callback receives a NodeJS.ReadableStream.

**speaking** (`event`): Emitted with audio metadata. Callback receives { audioData?: Int16Array, sampleRate?: number }.

**writing** (`event`): Emitted when transcribed text is available. Callback receives { text: string, role: 'assistant' | 'user' }. On native-audio models the assistant transcript is driven by the server's output\_audio\_transcription channel rather than modelTurn.parts.text.

**thinking** (`event`): Emitted on native-audio models with the model's chain-of-thought / reasoning text from modelTurn.parts.text. Callback receives { text: string }. Does not fire on non-native-audio models, where modelTurn.parts.text is the spoken response and is emitted as writing instead.

**session** (`event`): Emitted on session state changes. Callback receives { state: 'connecting' | 'connected' | 'disconnected' | 'disconnecting' | 'updated', config?: object }.

**turnComplete** (`event`): Emitted when a conversation turn is completed. Callback receives { timestamp: number }.

**toolCall** (`event`): Emitted when the model requests a tool call. Callback receives { name: string, args: object, id: string }.

**usage** (`event`): Emitted with token usage information. Callback receives { inputTokens: number, outputTokens: number, totalTokens: number, modality: string }.

**error** (`event`): Emitted when an error occurs. Callback receives { message: string, code?: string, details?: unknown }.

**interrupt** (`event`): Emitted on barge-in when the user starts speaking over an in-flight model response. The server cancels any further audio for the current turn. Callback receives { type: 'user', timestamp: number }.

## Native-audio behavior

Native-audio Gemini Live models (any model whose ID contains `native-audio`, such as `gemini-2.5-flash-native-audio-preview-12-2025`) split text output across two channels:

- The model's spoken reply is delivered as audio plus an `output_audio_transcription` transcript and surfaced as `writing` with `role: 'assistant'`.
- The model's internal reasoning is delivered as `modelTurn.parts.text` and surfaced as `thinking`.

On non-native-audio models there is no `output_audio_transcription` channel, so `modelTurn.parts.text` is the spoken response itself and is emitted as `writing`. The `thinking` event doesn't fire.

Input transcription, output transcription, and barge-in detection (`realtime_input_config.activity_handling = 'START_OF_ACTIVITY_INTERRUPTS'`) are enabled automatically in the setup payload. You don't need extra configuration.

## Available models

The following Gemini Live models are available:

- `gemini-2.0-flash-exp` (default)
- `gemini-2.0-flash-exp-image-generation`
- `gemini-2.0-flash-live-001`
- `gemini-live-2.5-flash-preview-native-audio`
- `gemini-2.5-flash-exp-native-audio-thinking-dialog`
- `gemini-live-2.5-flash-preview`
- `gemini-2.6.flash-preview-tts`

## Available voices

The following voice options are available:

- `Puck` (default): Conversational, friendly
- `Charon`: Deep, authoritative
- `Kore`: Neutral, professional
- `Fenrir`: Warm, approachable

## Authentication methods

### Gemini API (Development)

The simplest method using an API key from [Google AI Studio](https://makersuite.google.com/app/apikey):

```typescript
const voice = new GeminiLiveVoice({
  apiKey: 'your-api-key', // Required for Gemini API
  model: 'gemini-2.0-flash-exp',
})
```

### Vertex AI (Production)

For production use with OAuth authentication and Google Cloud Platform:

```typescript
// Using service account key file
const voice = new GeminiLiveVoice({
  vertexAI: true,
  project: 'your-gcp-project',
  location: 'us-central1',
  serviceAccountKeyFile: '/path/to/service-account.json',
})

// Using Application Default Credentials
const voice = new GeminiLiveVoice({
  vertexAI: true,
  project: 'your-gcp-project',
  location: 'us-central1',
})

// Using service account impersonation
const voice = new GeminiLiveVoice({
  vertexAI: true,
  project: 'your-gcp-project',
  location: 'us-central1',
  serviceAccountEmail: 'service-account@project.iam.gserviceaccount.com',
})
```

## Advanced features

### Session Management

The Gemini Live API supports session resumption for handling network interruptions:

```typescript
voice.on('sessionHandle', ({ handle, expiresAt }) => {
  // Store session handle for resumption
  saveSessionHandle(handle, expiresAt)
})

// Resume a previous session
const voice = new GeminiLiveVoice({
  sessionConfig: {
    enableResumption: true,
    maxDuration: '2h',
  },
})
```

### Tool Calling

Enable the model to call functions during conversations:

```typescript
import { z } from 'zod'

voice.addTools({
  weather: {
    description: 'Get weather information',
    parameters: z.object({
      location: z.string(),
    }),
    execute: async ({ location }) => {
      const weather = await getWeather(location)
      return weather
    },
  },
})

voice.on('toolCall', ({ name, args, id }) => {
  console.log(`Tool called: ${name} with args:`, args)
})
```

## Notes

- The Gemini Live API uses WebSockets for real-time communication
- Audio is processed as 16kHz PCM16 for input and 24kHz PCM16 for output
- The voice instance must be connected with `connect()` before using other methods
- Always call `close()` when done to properly clean up resources
- Vertex AI authentication requires appropriate IAM permissions (`aiplatform.user` role)
- Session resumption allows recovery from network interruptions
- The API supports real-time interactions with text and audio