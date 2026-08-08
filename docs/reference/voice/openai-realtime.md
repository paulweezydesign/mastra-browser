> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# OpenAI Realtime voice

The OpenAIRealtimeVoice class provides real-time voice interaction capabilities using OpenAI's WebSocket-based API. It supports real time speech to speech, voice activity detection, and event-based audio streaming.

## Usage example

```typescript
import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime'
import { playAudio, getMicrophoneStream } from '@mastra/node-audio'

// Initialize with default configuration using environment variables
const voice = new OpenAIRealtimeVoice()

// Or initialize with specific configuration
const voiceWithConfig = new OpenAIRealtimeVoice({
  apiKey: 'your-openai-api-key',
  model: 'gpt-5.1-realtime-preview-2024-12-17',
  speaker: 'alloy', // Default voice
})

voiceWithConfig.updateSession({
  turn_detection: {
    type: 'server_vad',
    threshold: 0.6,
    silence_duration_ms: 1200,
  },
})

// Establish connection
await voice.connect()

// Set up event listeners
voice.on('speaker', ({ audio }) => {
  // Handle audio data (Int16Array) pcm format by default
  playAudio(audio)
})

voice.on('writing', ({ text, role }) => {
  // Handle transcribed text
  console.log(`${role}: ${text}`)
})

// Convert text to speech
await voice.speak('Hello, how can I help you today?', {
  speaker: 'echo', // Override default voice
})

// Process audio input
const microphoneStream = getMicrophoneStream()
await voice.send(microphoneStream)

// When done, disconnect
voice.connect()
```

## Configuration

### Constructor options

**model** (`string`): The model ID to use for real-time voice interactions. (Default: `'gpt-5.1-realtime-preview-2024-12-17'`)

**apiKey** (`string`): OpenAI API key. Falls back to OPENAI\_API\_KEY environment variable.

**speaker** (`string`): Default voice ID for speech synthesis. (Default: `'alloy'`)

### Voice Activity Detection (VAD) Configuration

**type** (`string`): Type of VAD to use. Server-side VAD provides better accuracy. (Default: `'server_vad'`)

**threshold** (`number`): Speech detection sensitivity (0.0-1.0). (Default: `0.5`)

**prefix\_padding\_ms** (`number`): Milliseconds of audio to include before speech is detected. (Default: `1000`)

**silence\_duration\_ms** (`number`): Milliseconds of silence before ending a turn. (Default: `1000`)

## Methods

### `connect()`

Establishes a connection to the OpenAI Realtime service. Must be called before using speak, listen, or send functions.

**returns** (`Promise<void>`): Promise that resolves when the connection is established.

### `speak()`

Emits a speaking event using the configured voice model. Can accept either a string or a readable stream as input.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to convert to speech.

**options** (`Options`): Configuration options.

**options.speaker** (`string`): Voice ID to use for this specific speech request.

Returns: `Promise<void>`

### `listen()`

Processes audio input for speech recognition. Takes a readable stream of audio data and emits a 'listening' event with the transcribed text.

**audioData** (`NodeJS.ReadableStream`): Audio stream to transcribe.

Returns: `Promise<void>`

### `send()`

Streams audio data in real-time to the OpenAI service for continuous audio streaming scenarios like live microphone input.

**audioData** (`NodeJS.ReadableStream`): Audio stream to send to the service.

Returns: `Promise<void>`

### `updateConfig()`

Updates the session configuration for the voice instance. This can modify voice settings and turn detection. It can also modify other parameters.

**sessionConfig** (`Realtime.SessionConfig`): New session configuration to apply.

Returns: `void`

### `addTools()`

Adds a set of tools to the voice instance. Tools allow the model to perform additional actions during conversations. When OpenAIRealtimeVoice is added to an Agent, any tools configured for the Agent will automatically be available to the voice interface.

**tools** (`ToolsInput`): Tools configuration to equip.

Returns: `void`

### `close()`

Disconnects from the OpenAI Realtime session and cleans up resources. Should be called when you're done with the voice instance.

Returns: `void`

### `getSpeakers()`

Returns a list of available voice speakers.

Returns: `Promise<Array<{ voiceId: string; [key: string]: any }>>`

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

The OpenAIRealtimeVoice class emits the following events:

**speaking** (`event`): Emitted when audio data is received from the model. Callback receives { audio: Int16Array }.

**writing** (`event`): Emitted when transcribed text is available. Callback receives { text: string, role: string }.

**error** (`event`): Emitted when an error occurs. Callback receives the error object.

### OpenAI Realtime Events

You can also listen to [OpenAI Realtime utility events](https://github.com/openai/openai-realtime-api-beta#reference-client-utility-events) by prefixing with 'openAIRealtime:':

**openAIRealtime:conversation.created** (`event`): Emitted when a new conversation is created.

**openAIRealtime:conversation.interrupted** (`event`): Emitted when a conversation is interrupted.

**openAIRealtime:conversation.updated** (`event`): Emitted when a conversation is updated.

**openAIRealtime:conversation.item.appended** (`event`): Emitted when an item is appended to the conversation.

**openAIRealtime:conversation.item.completed** (`event`): Emitted when an item in the conversation is completed.

## Available voices

The following voice options are available:

- `alloy`: Neutral and balanced
- `ash`: Clear and precise
- `ballad`: Melodic and smooth
- `coral`: Warm and friendly
- `echo`: Resonant and deep
- `sage`: Calm and thoughtful
- `shimmer`: Bright and energetic
- `verse`: Versatile and expressive

## Notes

- API keys can be provided via constructor options or the `OPENAI_API_KEY` environment variable
- The OpenAI Realtime Voice API uses WebSockets for real-time communication
- Server-side Voice Activity Detection (VAD) provides better accuracy for speech detection
- All audio data is processed as Int16Array format
- The voice instance must be connected with `connect()` before using other methods
- Always call `close()` when done to properly clean up resources
- Memory management is handled by OpenAI Realtime API