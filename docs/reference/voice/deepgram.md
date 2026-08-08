> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Deepgram

The Deepgram voice implementation in Mastra provides text-to-speech (TTS) and speech-to-text (STT) capabilities using Deepgram's API. It supports multiple voice models and languages, with configurable options for both speech synthesis and transcription.

## Usage example

```typescript
import { DeepgramVoice } from '@mastra/voice-deepgram'

// Initialize with default configuration (uses DEEPGRAM_API_KEY environment variable)
const voice = new DeepgramVoice()

// Initialize with custom configuration
const voice = new DeepgramVoice({
  speechModel: {
    name: 'aura',
    apiKey: 'your-api-key',
  },
  listeningModel: {
    name: 'nova-2',
    apiKey: 'your-api-key',
  },
  speaker: 'asteria-en',
})

// Text-to-Speech
const audioStream = await voice.speak('Hello, world!')

// Speech-to-Text
const transcript = await voice.listen(audioStream)
```

## Constructor parameters

**speechModel** (`DeepgramVoiceConfig`): Configuration for text-to-speech functionality. (Default: `{ name: 'aura' }`)

**speechModel.name** (`DeepgramModel`): The Deepgram model to use

**speechModel.apiKey** (`string`): Deepgram API key. Falls back to DEEPGRAM\_API\_KEY environment variable

**speechModel.properties** (`Record<string, any>`): Additional properties to pass to the Deepgram API

**speechModel.language** (`string`): Language code for the model

**listeningModel** (`DeepgramVoiceConfig`): Configuration for speech-to-text functionality. (Default: `{ name: 'nova' }`)

**listeningModel.name** (`DeepgramModel`): The Deepgram model to use

**listeningModel.apiKey** (`string`): Deepgram API key. Falls back to DEEPGRAM\_API\_KEY environment variable

**listeningModel.properties** (`Record<string, any>`): Additional properties to pass to the Deepgram API

**listeningModel.language** (`string`): Language code for the model

**speaker** (`DeepgramVoiceId`): Default voice to use for text-to-speech (Default: `'asteria-en'`)

## Methods

### `speak()`

Converts text to speech using the configured speech model and voice.

**input** (`string | NodeJS.ReadableStream`): Text to convert to speech. If a stream is provided, it will be converted to text first.

**options** (`object`): Additional options for speech synthesis

**options.speaker** (`string`): Override the default speaker for this request

Returns: `Promise<NodeJS.ReadableStream>`

### `listen()`

Converts speech to text using the configured listening model.

**audioStream** (`NodeJS.ReadableStream`): Audio stream to transcribe

**options** (`object`): Additional options to pass to the Deepgram API

Returns: `Promise<string>`

### `getSpeakers()`

Returns a list of available voice options.

**voiceId** (`string`): Unique identifier for the voice