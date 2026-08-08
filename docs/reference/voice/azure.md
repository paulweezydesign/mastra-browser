> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Azure

The AzureVoice class in Mastra provides text-to-speech and speech-to-text capabilities using Microsoft Azure Cognitive Services.

## Usage example

This requires Azure Speech Services credentials that can be provided through environment variables or directly in the configuration:

```typescript
import { AzureVoice } from '@mastra/voice-azure'

// Initialize with configuration
const voice = new AzureVoice({
  speechModel: {
    apiKey: 'your-azure-speech-api-key', // Or use AZURE_API_KEY env var
    region: 'eastus', // Or use AZURE_REGION env var
    voiceName: 'en-US-AriaNeural', // Optional: specific voice for TTS
  },
  listeningModel: {
    apiKey: 'your-azure-speech-api-key', // Or use AZURE_API_KEY env var
    region: 'eastus', // Or use AZURE_REGION env var
    language: 'en-US', // Optional: recognition language for STT
  },
  speaker: 'en-US-JennyNeural', // Optional: default voice
})

// Convert text to speech
const audioStream = await voice.speak('Hello, how can I help you?', {
  speaker: 'en-US-GuyNeural', // Optional: override default voice
})

// Convert speech to text
const text = await voice.listen(audioStream)
```

## Configuration

### Constructor options

**speechModel** (`AzureSpeechConfig`): Configuration for text-to-speech synthesis.

**speechModel.apiKey** (`string`): Azure Speech Services API key (NOT Azure OpenAI key). Falls back to AZURE\_API\_KEY environment variable.

**speechModel.region** (`string`): Azure region (e.g., 'eastus', 'westeurope'). Falls back to AZURE\_REGION environment variable.

**speechModel.voiceName** (`string`): Voice ID for speech synthesis (e.g., 'en-US-AriaNeural', 'en-US-JennyNeural'). Only used in speechModel. See voice list below.

**speechModel.language** (`string`): Recognition language code (e.g., 'en-US', 'fr-FR'). Only used in listeningModel.

**listeningModel** (`AzureSpeechConfig`): Configuration for speech-to-text recognition.

**listeningModel.apiKey** (`string`): Azure Speech Services API key (NOT Azure OpenAI key). Falls back to AZURE\_API\_KEY environment variable.

**listeningModel.region** (`string`): Azure region (e.g., 'eastus', 'westeurope'). Falls back to AZURE\_REGION environment variable.

**listeningModel.voiceName** (`string`): Voice ID for speech synthesis (e.g., 'en-US-AriaNeural', 'en-US-JennyNeural'). Only used in speechModel. See voice list below.

**listeningModel.language** (`string`): Recognition language code (e.g., 'en-US', 'fr-FR'). Only used in listeningModel.

**speaker** (`string`): Default voice ID for speech synthesis.

## Methods

### `speak()`

Converts text to speech using Azure's neural text-to-speech service.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to convert to speech.

**options** (`Options`): Configuration options.

**options.speaker** (`string`): Voice ID to use for speech synthesis (e.g., 'en-US-JennyNeural'). Overrides the default voice.

Returns: `Promise<NodeJS.ReadableStream>` - Audio stream in WAV format

### `listen()`

Transcribes audio using Azure's speech-to-text service.

**audioStream** (`NodeJS.ReadableStream`): Audio stream to transcribe. Must be in WAV format.

Returns: `Promise<string>` - The recognized text from the audio

Language and recognition settings are configured in the `listeningModel` configuration during initialization, not passed as options to this method.

### `getSpeakers()`

Returns an array of available voice options (200+ voices), where each node contains:

**voiceId** (`string`): Unique identifier for the voice (e.g., 'en-US-JennyNeural', 'fr-FR-DeniseNeural')

**language** (`string`): Language code extracted from voice ID (e.g., 'en', 'fr')

**region** (`string`): Region code extracted from voice ID (e.g., 'US', 'GB', 'FR')

Returns: `Promise<Array<{ voiceId: string; language: string; region: string; }>>`

## Important notes

### Azure Speech Services vs Azure OpenAI

**⚠️ Critical:** This package uses **Azure Speech Services**, which is different from **Azure OpenAI Services**.

- **DON'T** use your `AZURE_OPENAI_API_KEY` for this package
- **DO** use an Azure Speech Services subscription key (obtain from Azure Portal under "Speech Services")
- These are separate Azure resources with different API keys and endpoints

### Environment variables

API keys and regions can be provided via constructor options or environment variables:

- `AZURE_API_KEY` - Your Azure Speech Services subscription key
- `AZURE_REGION` - Your Azure region (e.g., 'eastus', 'westeurope')

### Voice Capabilities

- Azure offers 200+ neural voices across 50+ languages
- Each voice ID follows the format: `{language}-{region}-{name}Neural` (e.g., 'en-US-JennyNeural')
- Some voices include multilingual support or HD quality variants
- Audio output is in WAV format
- Audio input for recognition must be in WAV format

## Available voices

Azure provides 200+ neural voices across many languages. Some popular English voices include:

- **US English:**

  - `en-US-AriaNeural` (Female, default)
  - `en-US-JennyNeural` (Female)
  - `en-US-GuyNeural` (Male)
  - `en-US-DavisNeural` (Male)
  - `en-US-AvaNeural` (Female)
  - `en-US-AndrewNeural` (Male)

- **British English:**

  - `en-GB-SoniaNeural` (Female)
  - `en-GB-RyanNeural` (Male)
  - `en-GB-LibbyNeural` (Female)

- **Australian English:**

  - `en-AU-NatashaNeural` (Female)
  - `en-AU-WilliamNeural` (Male)

To get a complete list of all 200+ voices:

```typescript
const voices = await voice.getSpeakers()
console.log(voices) // Array of { voiceId, language, region }
```

For more information, see the [Azure Neural TTS documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=tts).