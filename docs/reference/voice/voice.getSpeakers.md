> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# voice.getSpeakers()

The `getSpeakers()` method retrieves a list of available voice options (speakers) from the voice provider. Applications can present users with voice choices or programmatically select the most appropriate voice for different contexts.

## Usage example

```typescript
import { OpenAIVoice } from '@mastra/voice-openai'
import { ElevenLabsVoice } from '@mastra/voice-elevenlabs'

// Initialize voice providers
const openaiVoice = new OpenAIVoice()
const elevenLabsVoice = new ElevenLabsVoice({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

// Get available speakers from OpenAI
const openaiSpeakers = await openaiVoice.getSpeakers()
console.log('OpenAI voices:', openaiSpeakers)
// Example output: [{ voiceId: "alloy" }, { voiceId: "echo" }, { voiceId: "fable" }, ...]

// Get available speakers from ElevenLabs
const elevenLabsSpeakers = await elevenLabsVoice.getSpeakers()
console.log('ElevenLabs voices:', elevenLabsSpeakers)
// Example output: [{ voiceId: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" }, ...]

// Use a specific voice for speech
const text = 'Hello, this is a test of different voices.'
await openaiVoice.speak(text, { speaker: openaiSpeakers[2].voiceId })
await elevenLabsVoice.speak(text, { speaker: elevenLabsSpeakers[0].voiceId })
```

## Parameters

This method doesn't accept any parameters.

## Return value

**Promise\<Array<{ voiceId: string } & TSpeakerMetadata>>** (`Promise`): A promise that resolves to an array of voice options, where each option contains at least a voiceId property and may include additional provider-specific metadata.

## Provider-specific metadata

Different voice providers return different metadata for their voices:

**OpenAI**:

**voiceId** (`string`): Unique identifier for the voice (e.g., 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')

**OpenAI Realtime**:

**voiceId** (`string`): Unique identifier for the voice (e.g., 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')

**Deepgram**:

**voiceId** (`string`): Unique identifier for the voice

**language** (`string`): Language code embedded in the voice ID (e.g., 'en')

**ElevenLabs**:

**voiceId** (`string`): Unique identifier for the voice

**name** (`string`): Human-readable name of the voice

**category** (`string`): Category of the voice (e.g., 'premade', 'cloned')

**Google**:

**voiceId** (`string`): Unique identifier for the voice

**languageCodes** (`string[]`): Array of language codes supported by the voice (e.g., \['en-US'])

**Azure**:

**voiceId** (`string`): Unique identifier for the voice

**language** (`string`): Language code extracted from the voice ID (e.g., 'en')

**region** (`string`): Region code extracted from the voice ID (e.g., 'US')

**Murf**:

**voiceId** (`string`): Unique identifier for the voice

**name** (`string`): Name of the voice (same as voiceId)

**language** (`string`): Language code extracted from the voice ID (e.g., 'en')

**gender** (`string`): Gender of the voice (always 'neutral' in current implementation)

**PlayAI**:

**voiceId** (`string`): Unique identifier for the voice (S3 URL to manifest.json)

**name** (`string`): Human-readable name of the voice (e.g., 'Angelo', 'Arsenio')

**accent** (`string`): Accent of the voice (e.g., 'US', 'Irish', 'US African American')

**gender** (`string`): Gender of the voice ('M' or 'F')

**age** (`string`): Age category of the voice (e.g., 'Young', 'Middle')

**style** (`string`): Speaking style of the voice (e.g., 'Conversational')

**Speechify**:

**voiceId** (`string`): Unique identifier for the voice

**name** (`string`): Human-readable name of the voice

**language** (`string`): Language code of the voice (e.g., 'en-US')

**Sarvam**:

**voiceId** (`string`): Unique identifier for the voice

**name** (`string`): Human-readable name of the voice

**language** (`string`): Language of the voice (e.g., 'english', 'hindi')

**gender** (`string`): Gender of the voice ('male' or 'female')

## Notes

- The available voices vary substantially between providers
- Some providers may require authentication to retrieve the full list of voices
- The default implementation returns an empty array if the provider doesn't support this method
- For performance reasons, consider caching the results if you need to display the list frequently
- The `voiceId` property is guaranteed to be present for all providers, but additional metadata varies