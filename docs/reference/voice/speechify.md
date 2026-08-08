> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Speechify

The Speechify voice implementation in Mastra provides text-to-speech capabilities using Speechify's API.

## Usage example

```typescript
import { SpeechifyVoice } from '@mastra/voice-speechify'

// Initialize with default configuration (uses SPEECHIFY_API_KEY environment variable)
const voice = new SpeechifyVoice()

// Initialize with custom configuration
const voice = new SpeechifyVoice({
  speechModel: {
    name: 'simba-3.2',
    apiKey: 'your-api-key',
  },
  speaker: 'harper_32', // Default voice (simba-3.2 serves the curated Simba 3 voices only)
})

// Convert text to speech
const audioStream = await voice.speak('Hello, world!', {
  speaker: 'imogen_32', // Override default voice
})
```

## Constructor parameters

**speechModel** (`SpeechifyConfig`): Configuration for text-to-speech functionality (Default: `{ name: 'simba-english' }`)

**speechModel.name** (`SpeechifyModel`): The Speechify model to use ('simba-3.2', 'simba-3.0', 'simba-english', or 'simba-multilingual')

**speechModel.apiKey** (`string`): Speechify API key. Falls back to SPEECHIFY\_API\_KEY environment variable

**speaker** (`SpeechifyVoiceId`): Default voice ID to use for speech synthesis. The Simba 3 models serve a curated voice set only (harper\_32, imogen\_32, ...); the classic catalog voices (george, henry, ...) work with simba-english and simba-multilingual (Default: `'harper_32' for Simba 3 models, otherwise 'george'`)

## Methods

### `speak()`

Converts text to speech using the configured speech model and voice.

**input** (`string | NodeJS.ReadableStream`): Text to convert to speech. If a stream is provided, it will be converted to text first.

**options** (`Options`): Configuration options.

**options.speaker** (`string`): Override the default speaker for this request

**options.model** (`SpeechifyModel`): Override the default model for this request

Returns: `Promise<NodeJS.ReadableStream>`

### `getSpeakers()`

Returns an array of available voice options, where each node contains:

**voiceId** (`string`): Unique identifier for the voice

**name** (`string`): Display name of the voice

**language** (`string`): Language code for the voice

**gender** (`string`): Gender of the voice

### `listen()`

This method isn't supported by Speechify and will throw an error. Speechify doesn't provide speech-to-text functionality.

## Notes

- Speechify requires an API key for authentication
- The default model is 'simba-english'
- 'simba-3.2' is Speechify's latest streaming model with the lowest latency and richest expressivity, and the recommended model for English
- 'simba-3.2' and 'simba-3.0' are currently English only; use 'simba-multilingual' for non-English or mixed-language input
- 'simba-3.2' and 'simba-3.0' serve a curated voice set only: 'beatrice\_32', 'dominic\_32', 'edmund\_32', 'geffen\_32', 'harper\_32', 'hugh\_32', 'imogen\_32', 'wyatt\_32'. Classic catalog voices such as 'george' return an error on these models
- The default speaker follows the configured model: 'harper\_32' for the Simba 3 models, otherwise 'george'
- Speech-to-text functionality isn't supported
- Additional audio stream options can be passed through the speak() method's options parameter