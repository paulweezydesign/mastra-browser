> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Mistral

The MistralVoice class provides text-to-speech and speech-to-text capabilities using Mistral's Voxtral audio models. It supports buffered and streaming TTS, batch transcription with diarization, and voice cloning via reference audio.

## Usage example

```typescript
import { MistralVoice } from '@mastra/voice-mistral'

const voice = new MistralVoice()

// Text-to-speech
const audioStream = await voice.speak('Hello, how can I help you?', {
  responseFormat: 'mp3',
})

// Speech-to-text
const text = await voice.listen(audioStream, {
  language: 'en',
})

// List available voices
const speakers = await voice.getSpeakers()
```

```typescript
import { MistralVoice } from '@mastra/voice-mistral'

// Initialize with specific configuration
const voice = new MistralVoice({
  speechModel: {
    name: 'voxtral-mini-tts-2603',
    apiKey: 'your-mistral-api-key',
  },
  listeningModel: {
    name: 'voxtral-mini-latest',
    apiKey: 'your-mistral-api-key',
  },
  speaker: 'en_paul_neutral',
})
```

## Constructor parameters

**speechModel** (`MistralModelConfig`): Configuration for text-to-speech synthesis. (Default: `{ name: 'voxtral-mini-tts-2603' }`)

**speechModel.name** (`string`): Model ID for speech synthesis.

**speechModel.apiKey** (`string`): Mistral API key. Falls back to MISTRAL\_API\_KEY environment variable.

**listeningModel** (`MistralModelConfig`): Configuration for speech-to-text recognition. (Default: `{ name: 'voxtral-mini-latest' }`)

**listeningModel.name** (`string`): Model ID for transcription. Use 'voxtral-mini-2507' for a pinned version.

**listeningModel.apiKey** (`string`): Mistral API key. Falls back to MISTRAL\_API\_KEY environment variable.

**speaker** (`string`): Default voice ID for speech synthesis. Retrieve available IDs from getSpeakers(). (Default: `'en_paul_neutral'`)

## Methods

### `speak(input, options?)`

Converts text to speech using Mistral's Voxtral TTS model. Supports both buffered and streaming output.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to convert to speech.

**options** (`MistralSpeakOptions`): Configuration options.

**options.speaker** (`string`): Voice ID to use. Overrides the constructor default.

**options.responseFormat** (`'pcm' | 'wav' | 'mp3' | 'flac' | 'opus'`): Audio output format. Use 'pcm' for lowest latency streaming.

**options.refAudio** (`string`): Base64-encoded reference audio for one-off voice cloning (minimum 2-3 seconds).

**options.model** (`string`): Override the speech model for this call.

**options.stream** (`boolean`): Enable streaming TTS. Audio chunks are written to the stream as they arrive.

Returns: `Promise<NodeJS.ReadableStream>`

### `listen(audioStream, options?)`

Transcribes audio using Mistral's Voxtral transcription model. Supports diarization, context biasing, and timestamp level of detail.

**audioStream** (`NodeJS.ReadableStream`): Audio stream to transcribe.

**options** (`MistralListenOptions`): Configuration options.

**options.language** (`string`): Language code (e.g., 'en'). Improves accuracy when specified.

**options.diarize** (`boolean`): Enable speaker diarization.

**options.contextBias** (`string[]`): Words or phrases for vocabulary guidance.

**options.timestampGranularities** (`('segment' | 'word')[]`): Timestamp detail level for transcription segments.

**options.filetype** (`string`): Audio file extension hint for the input stream.

Returns: `Promise<string>`

### `getSpeakers()`

Fetches available preset voices from the Mistral Voices API. Each entry contains:

**voiceId** (`string`): Unique identifier for the voice.

**name** (`string`): Display name of the voice.

**languages** (`string[]`): Languages supported by the voice.

**gender** (`string | null`): Gender of the voice.

### `getListener()`

Returns `{ enabled: true }`.

## Notes

- API keys can be provided via constructor options or the `MISTRAL_API_KEY` environment variable
- TTS supports 9 languages: English, French, Spanish, Portuguese, Italian, Dutch, German, Hindi, Arabic
- STT supports 13 languages: English, Chinese, Hindi, Spanish, Arabic, French, Portuguese, Russian, German, Japanese, Korean, Italian, Dutch
- TTS input text should be kept under 300 words per request for best results
- STT supports up to 3 hours of audio per request
- Voice cloning via `refAudio` requires a minimum of 2-3 seconds of reference audio
- `getSpeakers()` returns preset voices with UUID identifiers. The default `en_paul_neutral` is a named alias accepted by the TTS endpoint but not included in the list