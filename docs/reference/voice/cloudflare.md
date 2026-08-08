> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Cloudflare

The CloudflareVoice class in Mastra provides text-to-speech capabilities using Cloudflare Workers AI. This provider specializes in efficient, low-latency speech synthesis suitable for edge computing environments.

## Usage example

```typescript
import { CloudflareVoice } from '@mastra/voice-cloudflare'

// Initialize with configuration
const voice = new CloudflareVoice({
  speechModel: {
    name: '@cf/meta/m2m100-1.2b',
    apiKey: 'your-cloudflare-api-token',
    accountId: 'your-cloudflare-account-id',
  },
  speaker: 'en-US-1', // Default voice
})

// Convert text to speech
const audioStream = await voice.speak('Hello, how can I help you?', {
  speaker: 'en-US-2', // Override default voice
})

// Get available voices
const speakers = await voice.getSpeakers()
console.log(speakers)
```

## Configuration

### Constructor options

**speechModel** (`CloudflareSpeechConfig`): Configuration for text-to-speech synthesis.

**speechModel.name** (`string`): Model name to use for TTS.

**speechModel.apiKey** (`string`): Cloudflare API token with Workers AI access. Falls back to CLOUDFLARE\_API\_TOKEN environment variable.

**speechModel.accountId** (`string`): Cloudflare account ID. Falls back to CLOUDFLARE\_ACCOUNT\_ID environment variable.

**speaker** (`string`): Default voice ID for speech synthesis. (Default: `'en-US-1'`)

## Methods

### `speak()`

Converts text to speech using Cloudflare's text-to-speech service.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to convert to speech.

**options** (`Options`): Configuration options.

**options.speaker** (`string`): Voice ID to use for speech synthesis.

**options.format** (`string`): Output audio format.

Returns: `Promise<NodeJS.ReadableStream>`

### `getSpeakers()`

Returns an array of available voice options, where each node contains:

**voiceId** (`string`): Unique identifier for the voice (e.g., 'en-US-1')

**language** (`string`): Language code of the voice (e.g., 'en-US')

## Notes

- API tokens can be provided via constructor options or environment variables (CLOUDFLARE\_API\_TOKEN and CLOUDFLARE\_ACCOUNT\_ID)
- Cloudflare Workers AI is optimized for edge computing with low latency
- This provider only supports text-to-speech (TTS) functionality, not speech-to-text (STT)
- The service integrates well with other Cloudflare Workers products
- For production use, ensure your Cloudflare account has the appropriate Workers AI subscription
- Voice options are more limited compared to some other providers, but performance at the edge is excellent

## Related providers

If you need speech-to-text capabilities in addition to text-to-speech, consider using one of these providers:

- [OpenAI](https://mastra.ai/reference/voice/openai): Provides both TTS and STT
- [Google](https://mastra.ai/reference/voice/google): Provides both TTS and STT
- [Azure](https://mastra.ai/reference/voice/azure): Provides both TTS and STT