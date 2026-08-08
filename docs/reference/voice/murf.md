> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Murf

The Murf voice implementation in Mastra provides text-to-speech (TTS) capabilities using Murf's AI voice service. It supports multiple voices across different languages.

## Usage example

```typescript
import { MurfVoice } from '@mastra/voice-murf'

// Initialize with default configuration (uses MURF_API_KEY environment variable)
const voice = new MurfVoice()

// Initialize with custom configuration
const voice = new MurfVoice({
  speechModel: {
    name: 'GEN2',
    apiKey: 'your-api-key',
    properties: {
      format: 'MP3',
      rate: 1.0,
      pitch: 1.0,
      sampleRate: 48000,
      channelType: 'STEREO',
    },
  },
  speaker: 'en-US-cooper',
})

// Text-to-Speech with default settings
const audioStream = await voice.speak('Hello, world!')

// Text-to-Speech with custom properties
const audioStream = await voice.speak('Hello, world!', {
  speaker: 'en-UK-hazel',
  properties: {
    format: 'WAV',
    rate: 1.2,
    style: 'casual',
  },
})

// Get available voices
const voices = await voice.getSpeakers()
```

## Constructor parameters

**speechModel** (`MurfConfig`): Configuration for text-to-speech functionality (Default: `{ name: 'GEN2' }`)

**speechModel.name** (`'GEN1' | 'GEN2'`): The Murf model generation to use

**speechModel.apiKey** (`string`): Murf API key. Falls back to MURF\_API\_KEY environment variable

**speechModel.properties** (`object`): Default properties for all speech synthesis requests

**speechModel.properties.style** (`string`): Speaking style for the voice

**speechModel.properties.rate** (`number`): Speech rate multiplier

**speechModel.properties.pitch** (`number`): Voice pitch adjustment

**speechModel.properties.sampleRate** (`8000 | 24000 | 44100 | 48000`): Audio sample rate in Hz

**speechModel.properties.format** (`'MP3' | 'WAV' | 'FLAC' | 'ALAW' | 'ULAW'`): Output audio format

**speechModel.properties.channelType** (`'STEREO' | 'MONO'`): Audio channel configuration

**speechModel.properties.pronunciationDictionary** (`Record<string, string>`): Custom pronunciation mappings

**speechModel.properties.encodeAsBase64** (`boolean`): Whether to encode the audio as base64

**speechModel.properties.variation** (`number`): Voice variation parameter

**speechModel.properties.audioDuration** (`number`): Target audio duration in seconds

**speechModel.properties.multiNativeLocale** (`string`): Locale for multilingual support

**speaker** (`string`): Default voice ID to use for text-to-speech (Default: `'en-UK-hazel'`)

## Methods

### `speak()`

Converts text to speech using Murf's API.

**input** (`string | NodeJS.ReadableStream`): Text to convert to speech. If a stream is provided, it will be converted to text first.

**options** (`object`): Speech synthesis options

**options.speaker** (`string`): Override the default speaker for this request

**options.properties** (`object`): Override default speech properties for this request

Returns: `Promise<NodeJS.ReadableStream>`

### `getSpeakers()`

Returns an array of available voice options, where each node contains:

**voiceId** (`string`): Unique identifier for the voice

**name** (`string`): Display name of the voice

**language** (`string`): Language code for the voice

**gender** (`string`): Gender of the voice

### `listen()`

This method isn't supported by Murf and will throw an error. Murf doesn't provide speech-to-text functionality.

## Important notes

1. A Murf API key is required. Set it via the `MURF_API_KEY` environment variable or pass it in the constructor.
2. The service uses GEN2 as the default model version.
3. Speech properties can be set at the constructor level and overridden per request.
4. The service supports extensive audio customization through properties like format, sample rate, and channel type.
5. Speech-to-text functionality isn't supported.