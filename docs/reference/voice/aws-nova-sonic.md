> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# AWS Nova Sonic voice

The `NovaSonicVoice` class provides real-time speech-to-speech capabilities backed by [AWS Bedrock Nova 2 Sonic](https://docs.aws.amazon.com/nova/latest/userguide/speech.html). It opens a bidirectional stream to the model and emits events for assistant audio, transcribed text, tool calls, turn boundaries, and interruptions.

## Usage example

```typescript
import { NovaSonicVoice } from '@mastra/voice-aws-nova-sonic'
import { playAudio, getMicrophoneStream } from '@mastra/node-audio'

// Initialize using the default AWS credential provider chain
const voice = new NovaSonicVoice({
  region: 'us-east-1',
  speaker: 'matthew',
})

// Or pass explicit credentials
const voiceWithCredentials = new NovaSonicVoice({
  region: 'us-east-1',
  speaker: 'tiffany',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Establish the bidirectional stream
await voice.connect()

// Listen for assistant audio (Int16Array PCM)
voice.on('speaking', ({ audioData }) => {
  if (audioData) playAudio(audioData)
})

// Listen for transcribed text from the user and assistant
voice.on('writing', ({ text, role, generationStage }) => {
  console.log(`${role} (${generationStage ?? 'FINAL'}): ${text}`)
})

// Stream microphone audio in real time
const microphoneStream = getMicrophoneStream()
await voice.send(microphoneStream)

// Disconnect when done
voice.close()
```

## Authentication

`NovaSonicVoice` uses the AWS SDK credential resolution chain when no `credentials` option is passed. Mastra calls `defaultProvider()` from `@aws-sdk/credential-provider-node`, which checks (in order) environment variables, shared credentials files, IAM role for EC2, ECS, EKS, and other standard sources.

To use static credentials, pass them on the constructor:

```typescript
new NovaSonicVoice({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
})
```

The voice provider never logs credential values.

## Configuration

### Constructor options

**region** (`'us-east-1' | 'us-west-2' | 'ap-northeast-1'`): AWS region that hosts the Nova Sonic model. (Default: `'us-east-1'`)

**model** (`string`): Bedrock model ID for the bidirectional stream. (Default: `'amazon.nova-2-sonic-v1:0'`)

**credentials** (`AwsCredentialIdentity`): Static AWS credentials. When omitted the default AWS credential provider chain is used.

**speaker** (`string | NovaSonicVoiceConfigDetails`): Default voice for the assistant. Pass a voice ID string such as 'matthew' or an object that includes a language code and gender. (Default: `'matthew'`)

**languageCode** (`NovaSonicLanguageCode`): Language code used for the session. Polyglot voices support all listed languages.

**instructions** (`string`): System prompt sent at session start. Equivalent to calling addInstructions() before connect().

**tools** (`NovaSonicToolConfig[]`): Tools exposed to the model. When the voice instance is attached to an Agent, the Agent's tools are added automatically.

**sessionConfig** (`NovaSonicSessionConfig`): Inference, turn-detection, and tool-choice configuration. See Session configuration below.

**debug** (`boolean`): Enable verbose logging for stream events. Sensitive fields are masked. (Default: `false`)

### Session configuration

`sessionConfig` controls inference parameters and turn-taking behavior. All fields are optional.

**inferenceConfiguration** (`object`): Sampling and decoding parameters.

**inferenceConfiguration.maxTokens** (`number`): Maximum tokens generated per turn.

**inferenceConfiguration.temperature** (`number`): Sampling temperature.

**inferenceConfiguration.topP** (`number`): Nucleus sampling probability.

**inferenceConfiguration.topK** (`number`): Top-k sampling.

**inferenceConfiguration.stopSequences** (`string[]`): Sequences that end generation.

**turnDetectionConfiguration** (`object`): Endpointing sensitivity for turn detection.

**turnDetectionConfiguration.endpointingSensitivity** (`'HIGH' | 'MEDIUM' | 'LOW'`): Pause duration before the model considers a turn complete. HIGH ends turns fastest (about 1.5s pause), MEDIUM is balanced (about 1.75s), LOW waits longest (about 2s).

**toolChoice** (`'auto' | 'any' | { tool: { name: string } }`): How the model decides whether to call a tool.

**enableKnowledgeGrounding** (`boolean`): Enable retrieval-augmented grounding against a Bedrock knowledge base.

**knowledgeBaseConfig** (`{ knowledgeBaseId?: string; dataSourceId?: string }`): Knowledge base used when knowledge grounding is enabled.

## Methods

### `connect()`

Opens the bidirectional stream to AWS Bedrock and sends the initial session, prompt, and system events. Call this before `speak`, `listen`, or `send`.

**options** (`{ requestContext?: RequestContext }`): Optional request context propagated to tool calls made during the session.

Returns: `Promise<void>`

### `speak()`

Synthesizes speech for a text prompt and emits `speaking` events as audio is produced.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to synthesize.

**options** (`NovaSonicVoiceOptions`): Per-call overrides such as the speaker or language code.

Returns: `Promise<void>`

### `send()`

Streams microphone audio (or any PCM source) to the model. Use this for live, continuous conversation.

**audioData** (`NodeJS.ReadableStream | Int16Array`): 16-bit PCM audio to forward to the model.

Returns: `Promise<void>`

### `listen()`

Convenience wrapper that delegates to `send()`. Use it when you want a single transcription pass over a finite audio stream.

**audioData** (`NodeJS.ReadableStream`): Audio stream to transcribe.

Returns: `Promise<void>`

### `endAudioInput()`

Signals the end of the current audio turn so the model can finalize its response. Call this when the user stops speaking and the provider isn't configured for server-side turn detection.

Returns: `Promise<void>`

### `addInstructions()`

Updates the system prompt for the active session.

**instructions** (`string`): System prompt to apply to the session.

Returns: `void`

### `addTools()`

Registers tools with the voice instance. When `NovaSonicVoice` is attached to an Agent, the Agent's tools are added automatically.

**tools** (`ToolsInput`): Tools exposed to the model.

Returns: `void`

### `getSpeakers()`

Returns the list of voices supported by Nova 2 Sonic.

Returns: `Promise<Array<{ voiceId: string; name: string; language: string; locale: string; gender: 'masculine' | 'feminine'; polyglot: boolean }>>`

### `getListener()`

Returns whether the voice instance currently holds an open stream.

Returns: `Promise<{ enabled: boolean }>`

### `close()`

Closes the bidirectional stream and destroys the underlying Bedrock client. Call this when the conversation ends.

Returns: `void`

### `on()` / `off()`

Registers and removes event listeners. See [Voice events](https://mastra.ai/reference/voice/voice.events) for the shared event API.

## Events

`NovaSonicVoice` emits the following events:

**speaking** (`event`): Assistant audio chunk. Callback receives { audioData: Int16Array, sampleRate?: number }.

**writing** (`event`): Transcribed text from the user or assistant. Callback receives { text: string, role: 'assistant' | 'user', generationStage?: 'SPECULATIVE' | 'FINAL' }.

**toolCall** (`event`): Model requested a tool call. Callback receives { name: string, args: Record\<string, any>, id: string }.

**interrupt** (`event`): User or model interrupted the current turn. Callback receives { type: 'user' | 'model', timestamp: number }.

**turnComplete** (`event`): Model finished its turn. Callback receives { timestamp: number }.

**session** (`event`): Session state transition. Callback receives { state: 'connecting' | 'connected' | 'disconnected' | 'disconnecting' | 'error' }.

**usage** (`event`): Token usage for the turn. Callback receives { inputTokens: number, outputTokens: number, totalTokens: number }.

**error** (`event`): Stream or provider error. Callback receives { message: string, code?: string, details?: unknown }.

`generationStage` distinguishes provisional transcripts (`'SPECULATIVE'`) from finalized ones (`'FINAL'`). Use `'FINAL'` text for persistent storage and `'SPECULATIVE'` text for live captions.

## Available voices

Nova 2 Sonic provides voices in ten locales. Tiffany and Matthew are polyglot and can speak any supported language.

| Voice ID   | Name     | Language   | Locale | Gender    | Polyglot |
| ---------- | -------- | ---------- | ------ | --------- | -------- |
| `tiffany`  | Tiffany  | English    | en-US  | feminine  | yes      |
| `matthew`  | Matthew  | English    | en-US  | masculine | yes      |
| `amy`      | Amy      | English    | en-GB  | feminine  | no       |
| `olivia`   | Olivia   | English    | en-AU  | feminine  | no       |
| `kiara`    | Kiara    | English    | en-IN  | feminine  | no       |
| `arjun`    | Arjun    | English    | en-IN  | masculine | no       |
| `ambre`    | Ambre    | French     | fr-FR  | feminine  | no       |
| `florian`  | Florian  | French     | fr-FR  | masculine | no       |
| `beatrice` | Beatrice | Italian    | it-IT  | feminine  | no       |
| `lorenzo`  | Lorenzo  | Italian    | it-IT  | masculine | no       |
| `tina`     | Tina     | German     | de-DE  | feminine  | no       |
| `lennart`  | Lennart  | German     | de-DE  | masculine | no       |
| `lupe`     | Lupe     | Spanish    | es-US  | feminine  | no       |
| `carlos`   | Carlos   | Spanish    | es-US  | masculine | no       |
| `carolina` | Carolina | Portuguese | pt-BR  | feminine  | no       |
| `leo`      | Leo      | Portuguese | pt-BR  | masculine | no       |
| `kiara`    | Kiara    | Hindi      | hi-IN  | feminine  | no       |
| `arjun`    | Arjun    | Hindi      | hi-IN  | masculine | no       |

## Notes

- Audio is streamed as 16-bit PCM. Assistant audio is emitted as `Int16Array` on the `speaking` event.
- The voice instance must call `connect()` before any other streaming method.
- `close()` destroys the underlying `BedrockRuntimeClient` to release the HTTP/2 session.
- Nova 2 Sonic is available in `us-east-1`, `us-west-2`, and `ap-northeast-1`. Other regions throw a configuration error during construction.