> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# OpenAI

The OpenAIVoice class in Mastra provides text-to-speech and speech-to-text capabilities using OpenAI's models.

## Usage example

```typescript
import { OpenAIVoice } from '@mastra/voice-openai'

// Initialize with default configuration using environment variables
const voice = new OpenAIVoice()

// Or initialize with specific configuration
const voiceWithConfig = new OpenAIVoice({
  speechModel: {
    name: 'tts-1-hd',
    apiKey: 'your-openai-api-key',
  },
  listeningModel: {
    name: 'whisper-1',
    apiKey: 'your-openai-api-key',
  },
  speaker: 'alloy', // Default voice
})

// Convert text to speech
const audioStream = await voice.speak('Hello, how can I help you?', {
  speaker: 'nova', // Override default voice
  speed: 1.2, // Adjust speech speed
})

// Convert speech to text
const text = await voice.listen(audioStream, {
  filetype: 'mp3',
})
```

## Configuration

### Constructor options

**speechModel** (`OpenAIConfig`): Configuration for text-to-speech synthesis. (Default: `{ name: 'tts-1' }`)

**speechModel.name** (`'tts-1' | 'tts-1-hd' | 'whisper-1'`): Model name. Use 'tts-1-hd' for higher quality audio.

**speechModel.apiKey** (`string`): OpenAI API key. Falls back to OPENAI\_API\_KEY environment variable.

**listeningModel** (`OpenAIConfig`): Configuration for speech-to-text recognition. (Default: `{ name: 'whisper-1' }`)

**listeningModel.name** (`'tts-1' | 'tts-1-hd' | 'whisper-1'`): Model name. Use 'tts-1-hd' for higher quality audio.

**listeningModel.apiKey** (`string`): OpenAI API key. Falls back to OPENAI\_API\_KEY environment variable.

**speaker** (`OpenAIVoiceId`): Default voice ID for speech synthesis. (Default: `'alloy'`)

## Methods

### `speak()`

Converts text to speech using OpenAI's text-to-speech models.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to convert to speech.

**options** (`Options`): Configuration options.

**options.speaker** (`OpenAIVoiceId`): Voice ID to use for speech synthesis.

**options.speed** (`number`): Speech speed multiplier.

Returns: `Promise<NodeJS.ReadableStream>`

### `listen()`

Transcribes audio using OpenAI's Whisper model.

**audioStream** (`NodeJS.ReadableStream`): Audio stream to transcribe.

**options** (`Options`): Configuration options.

**options.filetype** (`string`): Audio format of the input stream.

Returns: `Promise<string>`

### `getSpeakers()`

Returns an array of available voice options, where each node contains:

**voiceId** (`string`): Unique identifier for the voice

## Notes

- API keys can be provided via constructor options or the `OPENAI_API_KEY` environment variable
- The `tts-1-hd` model provides higher quality audio but may have slower processing times
- Speech recognition supports multiple audio formats including mp3, wav, and webm