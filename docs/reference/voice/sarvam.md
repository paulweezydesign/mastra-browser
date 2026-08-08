> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Sarvam

The SarvamVoice class in Mastra provides text-to-speech and speech-to-text capabilities using Sarvam AI models.

## Usage example

```typescript
import { SarvamVoice } from '@mastra/voice-sarvam'

// Initialize with default configuration using environment variables
const voice = new SarvamVoice()

// Or initialize with specific configuration
const voiceWithConfig = new SarvamVoice({
  speechModel: {
    model: 'bulbul:v3',
    apiKey: process.env.SARVAM_API_KEY!,
    language: 'en-IN',
    properties: {
      pace: 1.0,
      temperature: 0.6,
      speech_sample_rate: 24000,
      output_audio_codec: 'wav',
    },
  },
  listeningModel: {
    model: 'saarika:v2.5',
    apiKey: process.env.SARVAM_API_KEY!,
    languageCode: 'en-IN',
    filetype: 'wav',
  },
  speaker: 'shubh', // Default voice for bulbul:v3
})

// Convert text to speech
const audioStream = await voice.speak('Hello, how can I help you?')

// Convert speech to text
const text = await voice.listen(audioStream, {
  filetype: 'wav',
})
```

### Sarvam API Docs -

<https://docs.sarvam.ai/api-reference-docs/text-to-speech/convert>

## Configuration

### Constructor options

**speechModel** (`SarvamVoiceConfig`): Configuration for text-to-speech synthesis. (Default: `{ model: 'bulbul:v3', language: 'en-IN' }`)

**speechModel.apiKey** (`string`): Sarvam API key. Falls back to SARVAM\_API\_KEY environment variable.

**speechModel.model** (`SarvamTTSModel`): Specifies the model to use for text-to-speech conversion. Available options: bulbul:v2, bulbul:v3, bulbul:v3-beta. bulbul:v3-beta is a beta variant of bulbul:v3 that shares the same speaker catalog. Note: bulbul:v1 has been deprecated by Sarvam and is no longer supported.

**speechModel.language** (`SarvamTTSLanguage`): Target language for speech synthesis. Available options: hi-IN, bn-IN, kn-IN, ml-IN, mr-IN, od-IN, pa-IN, ta-IN, te-IN, en-IN, gu-IN

**speechModel.properties** (`object`): Additional voice properties for customization.

**speechModel.properties.pace** (`number`): Controls the speed of the audio. Supported by both bulbul:v2 (range 0.3–3.0) and bulbul:v3 (range 0.5–2.0).

**speechModel.properties.temperature** (`number`): Sampling temperature that controls the randomness of the generated voice. bulbul:v3 only. Range: 0.01–2.0. Default: 0.6.

**speechModel.properties.dict\_id** (`string`): Pronunciation dictionary ID. bulbul:v3 only.

**speechModel.properties.pitch** (`number`): Controls the pitch of the audio. Lower values result in a deeper voice, while higher values make it sharper. bulbul:v2 only. Range: -0.75 to 0.75.

**speechModel.properties.loudness** (`number`): Controls the loudness of the audio. bulbul:v2 only. Range: 0.3 to 3.0.

**speechModel.properties.enable\_preprocessing** (`boolean`): Enables normalization of English words and numeric entities (numbers, dates, etc.). bulbul:v2 only. Default is false.

**speechModel.properties.speech\_sample\_rate** (`8000 | 16000 | 22050 | 24000 | 32000 | 44100 | 48000`): Audio sample rate in Hz.

**speechModel.properties.output\_audio\_codec** (`'mp3' | 'wav' | 'linear16' | 'mulaw' | 'alaw' | 'opus' | 'flac' | 'aac'`): Output audio codec.

**speaker** (`SarvamVoiceId`): The speaker to be used for the output audio. Defaults to 'shubh'. bulbul:v3 supports 39 voices (shubh, aditya, ritu, priya, neha, rahul, pooja, rohan, simran, kavya, amit, dev, ishita, shreya, ratan, varun, manan, sumit, roopa, kabir, aayan, ashutosh, advait, amelia, sophia, anand, tanya, tarun, sunny, mani, gokul, vijay, shruti, suhani, mohit, kavitha, rehan, soham, rupali). bulbul:v2 supports 7 voices (anushka, manisha, vidya, arya, abhilash, karun, hitesh). Speakers are not interchangeable between model versions. (Default: `'shubh'`)

**listeningModel** (`SarvamListenOptions`): Configuration for speech-to-text recognition. (Default: `{ model: 'saarika:v2.5', languageCode: 'unknown' }`)

**listeningModel.apiKey** (`string`): Sarvam API key. Falls back to SARVAM\_API\_KEY environment variable.

**listeningModel.model** (`SarvamSTTModel`): Specifies the model to use for speech-to-text conversion. Available options: saarika:v2.5 (transcription), saaras:v3 (multi-mode: transcribe/translate/verbatim/translit/codemix). Note: saarika:v1, saarika:v2, and saarika:flash have been deprecated by Sarvam.

**listeningModel.languageCode** (`SarvamSTTLanguage`): BCP-47 language code of the input audio. Optional for saarika:v2.5 and saaras:v3 (the API will detect the language automatically when 'unknown' is passed). Available options: unknown, hi-IN, bn-IN, kn-IN, ml-IN, mr-IN, od-IN, pa-IN, ta-IN, te-IN, en-IN, gu-IN.

**listeningModel.filetype** (`'mp3' | 'wav'`): Audio format of the input stream.

**listeningModel.mode** (`SarvamSTTMode`): Operation mode. Only valid when using the saaras:v3 model; ignored by saarika:v2.5. Available options: 'transcribe', 'translate', 'verbatim', 'translit', 'codemix'.

## Methods

### `speak()`

Converts text to speech using Sarvam's text-to-speech models.

**input** (`string | NodeJS.ReadableStream`): Text or text stream to convert to speech.

**options** (`Options`): Configuration options.

**options.speaker** (`SarvamVoiceId`): Voice ID to use for speech synthesis.

Returns: `Promise<NodeJS.ReadableStream>`

### `listen()`

Transcribes audio using Sarvam's speech recognition models.

**input** (`NodeJS.ReadableStream`): Audio stream to transcribe.

**options** (`SarvamListenOptions`): Configuration options for speech recognition.

Returns: `Promise<string>`

### `getSpeakers()`

Returns an array of available voice options.

Returns: `Promise<Array<{voiceId: SarvamVoiceId}>>`

## Notes

- API key can be provided via constructor options or the `SARVAM_API_KEY` environment variable
- If no API key is provided, the constructor will throw an error
- The service communicates with the Sarvam AI API at `https://api.sarvam.ai`
- Audio is returned as a stream containing binary audio data
- Speech recognition supports mp3 and wav audio formats
- `bulbul:v1`, `saarika:v1`, `saarika:v2`, and `saarika:flash` have been deprecated by Sarvam and are no longer supported. Use `bulbul:v3` (or `bulbul:v2`) for TTS and `saarika:v2.5` (or `saaras:v3`) for STT.
- Speaker names aren't interchangeable between `bulbul:v2` and `bulbul:v3`. Each model version has its own speaker catalog.