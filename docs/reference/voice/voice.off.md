> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# voice.off()

The `off()` method removes event listeners previously registered with the `on()` method. This is particularly useful for cleaning up resources and preventing memory leaks in long-running applications with real-time voice capabilities.

## Usage example

```typescript
import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime'
import chalk from 'chalk'

// Initialize a real-time voice provider
const voice = new OpenAIRealtimeVoice({
  realtimeConfig: {
    model: 'gpt-5.1-realtime',
    apiKey: process.env.OPENAI_API_KEY,
  },
})

// Connect to the real-time service
await voice.connect()

// Define the callback function
const writingCallback = ({ text, role }) => {
  if (role === 'user') {
    process.stdout.write(chalk.green(text))
  } else {
    process.stdout.write(chalk.blue(text))
  }
}

// Register event listener
voice.on('writing', writingCallback)

// Later, when you want to remove the listener
voice.off('writing', writingCallback)
```

## Parameters

**event** (`string`): Name of the event to stop listening for (e.g., 'speaking', 'writing', 'error')

**callback** (`function`): The same callback function that was passed to on()

## Return value

This method doesn't return a value.

## Notes

- The callback passed to `off()` must be the same function reference that was passed to `on()`
- If the callback isn't found, the method will have no effect
- This method is primarily used with real-time voice providers that support event-based communication
- If called on a voice provider that doesn't support events, it will log a warning and do nothing
- Removing event listeners is important for preventing memory leaks in long-running applications