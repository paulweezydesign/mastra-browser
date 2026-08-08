> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# ElevenLabs

The ElevenLabs voice implementation in Mastra provides high-quality text-to-speech (TTS) and speech-to-text (STT) capabilities using the ElevenLabs API.

## Usage example

```typescript
import { ElevenLabsVoice } from '@mastra/voice-elevenlabs'

// Initialize with default configuration (uses ELEVENLABS_API_KEY environment variable)
const voice = new ElevenLabsVoice()

// Initialize with custom configuration
const voice = new ElevenLabsVoice({
  speechModel: {
    name: 'eleven_multilingual_v2',
    apiKey: 'your-api-key',
  },
  speaker: 'custom-speaker-id',
})

// Text-to-Speech
const audioStream = await voice.speak('Hello, world!')

// Get available speakers
const speakers = await voice.getSpeakers()
```

## Constructor parameters

**speechModel** (`ElevenLabsVoiceConfig`): Configuration for text-to-speech functionality. (Default: `{ name: 'eleven_multilingual_v2' }`)

**speechModel.name** (`ElevenLabsModel`): The ElevenLabs model to use

**speechModel.apiKey** (`string`): ElevenLabs API key. Falls back to ELEVENLABS\_API\_KEY environment variable

**speaker** (`string`): ID of the speaker to use for text-to-speech (Default: `'9BWtsMINqrJLrRacOk9x' (Aria voice)`)

## Methods

### `speak()`

Converts text to speech using the configured speech model and voice.

**input** (`string | NodeJS.ReadableStream`): Text to convert to speech. If a stream is provided, it will be converted to text first.

**options** (`object`): Additional options for speech synthesis

**options.speaker** (`string`): Override the default speaker ID for this request

Returns: `Promise<NodeJS.ReadableStream>`

### `getSpeakers()`

Returns an array of available voice options, where each node contains:

**voiceId** (`string`): Unique identifier for the voice

**name** (`string`): Display name of the voice

**language** (`string`): Language code for the voice

**gender** (`string`): Gender of the voice

### `listen()`

Converts audio input to text using ElevenLabs Speech-to-Text API.

**input** (`NodeJS.ReadableStream`): A readable stream containing the audio data to transcribe

**options** (`object`): Configuration options for the transcription

The options object supports the following properties:

**language\_code** (`string`): ISO language code (e.g., 'en', 'fr', 'es')

**tag\_audio\_events** (`boolean`): Whether to tag audio events like \[MUSIC], \[LAUGHTER], etc.

**num\_speakers** (`number`): Number of speakers to detect in the audio

**filetype** (`string`): Audio file format (e.g., 'mp3', 'wav', 'ogg')

**timeoutInSeconds** (`number`): Request timeout in seconds

**maxRetries** (`number`): Maximum number of retry attempts

**abortSignal** (`AbortSignal`): Signal to abort the request

Returns: `Promise<string>` - A Promise that resolves to the transcribed text

## Important notes

1. An ElevenLabs API key is required. Set it via the `ELEVENLABS_API_KEY` environment variable or pass it in the constructor.
2. The default speaker is set to Aria (ID: '9BWtsMINqrJLrRacOk9x').
3. Speech-to-text functionality isn't supported by ElevenLabs.
4. Available speakers can be retrieved using the `getSpeakers()` method, which returns detailed information about each voice including language and gender.