> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# voice.updateConfig()

The `updateConfig()` method allows you to update the configuration of a voice provider at runtime. This is useful for changing voice settings, API keys, or other provider-specific options without creating a new instance.

## Usage example

```typescript
import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime'

// Initialize a real-time voice provider
const voice = new OpenAIRealtimeVoice({
  realtimeConfig: {
    model: 'gpt-5.1-realtime',
    apiKey: process.env.OPENAI_API_KEY,
  },
  speaker: 'alloy',
})

// Connect to the real-time service
await voice.connect()

// Later, update the configuration
voice.updateConfig({
  voice: 'nova', // Change the default voice
  turn_detection: {
    type: 'server_vad',
    threshold: 0.5,
    silence_duration_ms: 1000,
  },
})

// The next speak() call will use the new configuration
await voice.speak('Hello with my new voice!')
```

## Parameters

**options** (`Record<string, unknown>`): Configuration options to update. The specific properties depend on the voice provider.

## Return value

This method doesn't return a value.

## Configuration options

Different voice providers support different configuration options:

### OpenAI Realtime

**voice** (`string`): Voice ID to use for speech synthesis (e.g., 'alloy', 'echo', 'nova')

**turn\_detection** (`{ type: string, threshold?: number, silence_duration_ms?: number }`): Configuration for detecting when a user has finished speaking

## Notes

- The default implementation logs a warning if the provider doesn't support this method
- Configuration updates are typically applied to subsequent operations, not ongoing ones
- Not all properties that can be set in the constructor can be updated at runtime
- The specific behavior depends on the voice provider implementation
- For real-time voice providers, some configuration changes may require reconnecting to the service