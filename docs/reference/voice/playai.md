> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# PlayAI

The PlayAI voice implementation in Mastra provides text-to-speech capabilities using PlayAI's API.

## Usage example

```typescript
import { PlayAIVoice } from '@mastra/voice-playai'

// Initialize with default configuration (uses PLAYAI_API_KEY environment variable and PLAYAI_USER_ID environment variable)
const voice = new PlayAIVoice()

// Initialize with default configuration
const voice = new PlayAIVoice({
  speechModel: {
    name: 'PlayDialog',
    apiKey: process.env.PLAYAI_API_KEY,
    userId: process.env.PLAYAI_USER_ID,
  },
  speaker: 'Angelo', // Default voice
})

// Convert text to speech with a specific voice
const audioStream = await voice.speak('Hello, world!', {
  speaker:
    's3://voice-cloning-zero-shot/b27bc13e-996f-4841-b584-4d35801aea98/original/manifest.json', // Dexter voice
})
```

## Constructor parameters

**speechModel** (`PlayAIConfig`): Configuration for text-to-speech functionality (Default: `{ name: 'PlayDialog' }`)

**speechModel.name** (`'PlayDialog' | 'Play3.0-mini'`): The PlayAI model to use

**speechModel.apiKey** (`string`): PlayAI API key. Falls back to PLAYAI\_API\_KEY environment variable

**speechModel.userId** (`string`): PlayAI user ID. Falls back to PLAYAI\_USER\_ID environment variable

**speaker** (`string`): Default voice ID to use for speech synthesis (Default: `First available voice ID`)

## Methods

### `speak()`

Converts text to speech using the configured speech model and voice.

**input** (`string | NodeJS.ReadableStream`): Text to convert to speech. If a stream is provided, it will be converted to text first.

**options** (`Options`): Configuration options.

**options.speaker** (`string`): Override the default speaker for this request

Returns: `Promise<NodeJS.ReadableStream>`.

### `getSpeakers()`

Returns an array of available voice options, where each node contains:

**name** (`string`): Name of the voice

**accent** (`string`): Accent of the voice (e.g., 'US', 'British', 'Australian')

**gender** (`'M' | 'F'`): Gender of the voice

**age** (`'Young' | 'Middle' | 'Old'`): Age category of the voice

**style** (`'Conversational' | 'Narrative'`): Speaking style of the voice

**voiceId** (`string`): Unique identifier for the voice

### `listen()`

This method isn't supported by PlayAI and will throw an error. PlayAI doesn't provide speech-to-text functionality.

## Notes

- PlayAI requires both an API key and a user ID for authentication
- The service offers two models: 'PlayDialog' and 'Play3.0-mini'
- Each voice has a unique S3 manifest ID that must be used when making API calls