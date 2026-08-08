> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Inworld

The Inworld voice implementation in Mastra provides streaming text-to-speech (TTS) and batch speech-to-text (STT) capabilities using Inworld AI's API. It supports multiple TTS and STT models, configurable audio encodings, and progressive audio streaming.

For real-time, full-duplex speech-to-speech, the same package exports [`InworldRealtimeVoice`](https://mastra.ai/reference/voice/inworld-realtime).

## Usage example

```typescript
import { InworldVoice } from '@mastra/voice-inworld'

// Initialize with default configuration (uses INWORLD_API_KEY environment variable)
const voice = new InworldVoice()

// Initialize with custom configuration
const voice = new InworldVoice({
  speechModel: {
    name: 'inworld-tts-2',
    apiKey: 'your-api-key',
  },
  listeningModel: {
    name: 'groq/whisper-large-v3',
    apiKey: 'your-api-key',
  },
  speaker: 'Dennis',
})

// Text-to-Speech (streaming)
const audioStream = await voice.speak('Hello, world!')

// Speech-to-Text
const transcript = await voice.listen(audioStream)
```

## Constructor parameters

**speechModel** (`InworldVoiceConfig`): Configuration for text-to-speech functionality. (Default: `{ name: 'inworld-tts-2' }`)

**speechModel.name** (`'inworld-tts-2' | 'inworld-tts-1.5-max' | 'inworld-tts-1.5-mini'`): The Inworld TTS model to use.

**speechModel.apiKey** (`string`): Inworld API key. Falls back to INWORLD\_API\_KEY environment variable.

**listeningModel** (`InworldListeningConfig`): Configuration for speech-to-text functionality. (Default: `{ name: 'groq/whisper-large-v3' }`)

**listeningModel.name** (`'groq/whisper-large-v3'`): The Inworld STT model to use.

**listeningModel.apiKey** (`string`): Inworld API key. Falls back to INWORLD\_API\_KEY environment variable.

**speaker** (`string`): Default voice ID to use for text-to-speech. (Default: `'Dennis'`)

**audioEncoding** (`'LINEAR16' | 'MP3' | 'OGG_OPUS' | 'ALAW' | 'MULAW' | 'FLAC' | 'PCM' | 'WAV'`): Default audio encoding for TTS output. (Default: `'MP3'`)

**sampleRateHertz** (`number`): Default sample rate for TTS output. (Default: `48000`)

**language** (`string`): Default BCP-47 language code for STT. (Default: `'en-US'`)

## Methods

### `speak(input, options?)`

Converts text to speech using Inworld's streaming TTS endpoint. Returns a readable stream that emits audio chunks progressively as they arrive.

```typescript
const audioStream = await voice.speak('Hello, world!', {
  speaker: 'Olivia',
  audioEncoding: 'WAV',
  sampleRateHertz: 24000,
  speakingRate: 1.2,
  temperature: 0.8,
})
```

**input** (`string | NodeJS.ReadableStream`): Text to convert to speech. If a stream is provided, it will be converted to text first.

**options** (`InworldSpeakOptions`): Additional options for speech synthesis.

**options.speaker** (`string`): Override the default speaker for this request.

**options.audioEncoding** (`AudioEncoding`): Override the default audio encoding.

**options.sampleRateHertz** (`number`): Override the default sample rate.

**options.speakingRate** (`number`): Adjust the speaking rate.

**options.temperature** (`number`): Controls voice variability. Honored on inworld-tts-1.5-\* models; ignored by inworld-tts-2.

**options.deliveryMode** (`'STABLE' | 'BALANCED' | 'CREATIVE'`): Steering control for delivery style. Only honored by inworld-tts-2.

**options.language** (`string`): BCP-47 language code for this request. Auto-detected when omitted.

**Returns:** `Promise<NodeJS.ReadableStream>`

### `listen(input, options?)`

Converts speech to text using Inworld's batch STT endpoint.

```typescript
const transcript = await voice.listen(audioStream, {
  audioEncoding: 'MP3',
  sampleRateHertz: 44100,
  language: 'ja-JP',
})
```

**input** (`NodeJS.ReadableStream`): Audio stream to transcribe.

**options** (`InworldListenOptions`): Additional options for transcription.

**options.audioEncoding** (`'LINEAR16' | 'MP3' | 'OGG_OPUS' | 'FLAC' | 'AUTO_DETECT'`): Audio encoding of the input stream.

**options.sampleRateHertz** (`number`): Sample rate of the input audio.

**options.language** (`string`): BCP-47 language code for transcription.

**options.numberOfChannels** (`number`): Number of audio channels in the input.

**Returns:** `Promise<string>`

### `getSpeakers()`

Returns a list of available voices from the Inworld API.

```typescript
const speakers = await voice.getSpeakers()
// [{ voiceId: 'Dennis', name: 'Dennis', language: 'en', description: '...', tags: ['friendly'], source: 'SYSTEM' }, ...]
```

**Returns:** `Promise<Array<{ voiceId: string; name: string; language: string; description: string; tags: string[]; source: string }>>`

## Notes

- The TTS endpoint uses progressive NDJSON streaming, so audio playback can begin before the full response is received.
- An API key can be provided via the `speechModel` or `listeningModel` config, or the `INWORLD_API_KEY` environment variable. TTS and STT keys are resolved independently: passing distinct `speechModel.apiKey` and `listeningModel.apiKey` values lets each service use its own credential. If only one is provided, it's reused for both services as a fallback before the env var.
- `inworld-tts-2` is the default flagship model. Use `deliveryMode` (`STABLE` | `BALANCED` | `CREATIVE`) to steer delivery style on this model. The `temperature` option is ignored on `inworld-tts-2`.
- The `inworld-tts-1.5-mini` model offers lower latency at the cost of reduced voice quality compared to `inworld-tts-1.5-max`.