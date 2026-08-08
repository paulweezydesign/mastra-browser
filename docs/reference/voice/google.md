> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Google

The Google Voice implementation in Mastra provides both text-to-speech (TTS) and speech-to-text (STT) capabilities using Google Cloud services. It supports multiple voices, languages, advanced audio configuration options, and both standard API key authentication and Vertex AI mode for enterprise deployments.

## Usage example

```typescript
import { GoogleVoice } from '@mastra/voice-google'

// Initialize with default configuration (uses GOOGLE_API_KEY environment variable)
const voice = new GoogleVoice()

// Text-to-Speech (plain text)
const audioStream = await voice.speak('Hello, world!', {
  languageCode: 'en-US',
  audioConfig: {
    audioEncoding: 'LINEAR16',
  },
})

// Text-to-Speech with SSML
const ssmlStream = await voice.speak('ignored', {
  input: {
    ssml: '<speak>Take <say-as interpret-as="unit">5 mg</say-as> daily.</speak>',
  },
})

// Text-to-Speech with Gemini-TTS model
const geminiStream = await voice.speak('Hello from Gemini TTS!', {
  voice: { name: 'Kore', modelName: 'gemini-2.5-flash-preview-tts' },
  input: { prompt: 'Warm, calm tone.' },
})

// Speech-to-Text
const transcript = await voice.listen(audioStream, {
  config: {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
  },
})

// Get available voices for a specific language
const voices = await voice.getSpeakers({ languageCode: 'en-US' })
```

## Constructor parameters

**speechModel** (`GoogleModelConfig`): Configuration for text-to-speech functionality (Default: `{ apiKey: process.env.GOOGLE_API_KEY }`)

**speechModel.apiKey** (`string`): Google Cloud API key. Falls back to GOOGLE\_API\_KEY environment variable. Not used when vertexAI is true.

**speechModel.keyFilename** (`string`): Path to service account JSON key file. Falls back to GOOGLE\_APPLICATION\_CREDENTIALS environment variable.

**speechModel.credentials** (`object`): In-memory service account credentials object with client\_email and private\_key properties.

**listeningModel** (`GoogleModelConfig`): Configuration for speech-to-text functionality (Default: `{ apiKey: process.env.GOOGLE_API_KEY }`)

**listeningModel.apiKey** (`string`): Google Cloud API key. Falls back to GOOGLE\_API\_KEY environment variable. Not used when vertexAI is true.

**listeningModel.keyFilename** (`string`): Path to service account JSON key file. Falls back to GOOGLE\_APPLICATION\_CREDENTIALS environment variable.

**listeningModel.credentials** (`object`): In-memory service account credentials object with client\_email and private\_key properties.

**speaker** (`string`): Default voice ID to use for text-to-speech (Default: `'en-US-Casual-K'`)

**vertexAI** (`boolean`): Enable Vertex AI mode for enterprise deployments. Uses project-based authentication instead of API keys. Requires 'project' to be set. (Default: `false`)

**project** (`string`): Google Cloud project ID (required when vertexAI is true). Falls back to GOOGLE\_CLOUD\_PROJECT environment variable.

**location** (`string`): Google Cloud region for Vertex AI. Falls back to GOOGLE\_CLOUD\_LOCATION environment variable. (Default: `'us-central1'`)

## Methods

### `speak()`

Converts text to speech using Google Cloud Text-to-Speech service.

**input** (`string | NodeJS.ReadableStream`): Text to convert to speech. If a stream is provided, it will be converted to text first.

**options** (`object`): Speech synthesis options

**options.speaker** (`string`): Voice ID to use for this request.

**options.languageCode** (`string`): Language code for the voice (e.g., 'en-US'). Defaults to the language code derived from the speaker ID, or 'en-US'.

**options.input** (`ISynthesizeSpeechRequest['input']`): Rich input object passed through to the Google Cloud TTS API. Supports ssml, markup, prompt (Gemini-TTS style steering), customPronunciations, and multiSpeakerMarkup. When provided without text, ssml, markup, or multiSpeakerMarkup, the positional input argument is used as the text field automatically.

**options.voice** (`ISynthesizeSpeechRequest['voice']`): Voice configuration merged on top of defaults (name and languageCode). Supports modelName (e.g., 'gemini-2.5-flash-preview-tts') and multiSpeakerVoiceConfig.

**options.audioConfig** (`ISynthesizeSpeechRequest['audioConfig']`): Audio configuration options from Google Cloud Text-to-Speech API.

Returns: `Promise<NodeJS.ReadableStream>`

### `listen()`

Converts speech to text using Google Cloud Speech-to-Text service. Supports both v1 (default) and v2 APIs. The v2 API adds support for AAC-in-MP4 audio (iOS Safari) via auto-decoding.

#### v1 (default)

**audioStream** (`NodeJS.ReadableStream`): Audio stream to transcribe

**options** (`GoogleListenOptionsV1`): v1 recognition options

**options.config** (`IRecognitionConfig`): v1 recognition configuration from Google Cloud Speech-to-Text API

#### v2

Pass `v2: true` to use the Cloud Speech-to-Text v2 API, which supports additional audio formats like AAC-in-MP4 (iOS Safari).

The v2 `recognize` call is IAM-authorized and does not accept API-key-only authentication. Configure service account credentials on the `listeningModel` (or set `GOOGLE_APPLICATION_CREDENTIALS`) and set `GOOGLE_CLOUD_PROJECT` so the recognizer path can be resolved, even when `vertexAI` is not enabled.

```typescript
import { GoogleVoice } from '@mastra/voice-google'

// v2 listen() requires service account credentials, not just GOOGLE_API_KEY.
// Set GOOGLE_CLOUD_PROJECT so the recognizer path can be resolved.
const voice = new GoogleVoice({
  listeningModel: { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS },
})

const transcript = await voice.listen(iosSafariAacStream, {
  v2: true,
  config: {
    autoDecodingConfig: {},
  },
})
```

> **Note:** `listen({ v2: true })` fails with `PERMISSION_DENIED` on `speech.recognizers.recognize` when only `GOOGLE_API_KEY` is set. An API-key request carries no OAuth identity, so granting `roles/speech.client` to a user account does not help — the role must be granted to the service account presented in the request. This applies regardless of the `vertexAI` setting; `speak()` and v1 `listen()` still work with an API key alone.

**audioStream** (`NodeJS.ReadableStream`): Audio stream to transcribe

**options** (`GoogleListenOptionsV2`): v2 recognition options

**options.v2** (`true`): Enables the v2 API path

**options.config** (`v2.IRecognitionConfig`): v2 recognition configuration. Defaults to auto-decoding with languageCodes: \['en-US'] and model: 'long'. Set autoDecodingConfig: {} to auto-detect the audio format, or use explicitDecodingConfig to specify an encoding like MP4\_AAC, M4A\_AAC, or MOV\_AAC.

**options.recognizer** (`string`): v2 recognizer resource path. Defaults to projects/{project}/locations/global/recognizers/\_ where {project} is resolved from the constructor project option, GOOGLE\_CLOUD\_PROJECT, or the client's default project.

Returns: `Promise<string>`

### `getSpeakers()`

Returns an array of available voice options, where each node contains:

**voiceId** (`string`): Unique identifier for the voice

**languageCodes** (`string[]`): List of language codes supported by this voice

### `isUsingVertexAI()`

Checks if Vertex AI mode is enabled.

Returns: `boolean` - `true` if using Vertex AI, `false` otherwise

### `getProject()`

Gets the configured Google Cloud project ID.

Returns: `string | undefined` - The project ID or `undefined` if not set

### `getLocation()`

Gets the configured Google Cloud location/region.

Returns: `string` - The location (default: `'us-central1'`)

## Authentication

The Google Voice provider supports two authentication methods:

### Standard Mode (API Key)

Uses a Google Cloud API key for authentication. Covers `speak()` and v1 `listen()`. It does not cover `listen({ v2: true })`, which is IAM-authorized and requires service account credentials (see [v2](#v2)).

```typescript
// Using environment variable (GOOGLE_API_KEY)
const voice = new GoogleVoice()

// Using explicit API key
const voice = new GoogleVoice({
  speechModel: { apiKey: 'your-api-key' },
  listeningModel: { apiKey: 'your-api-key' },
  speaker: 'en-US-Casual-K',
})
```

### Vertex AI Mode (Service Account)

Uses Google Cloud project-based authentication with service accounts. Recommended for production and enterprise deployments.

**Benefits:**

- Better security (no API keys in code)
- IAM-based access control
- Project-level billing and quotas
- Audit logging
- Enterprise features

**Configuration Options:**

```typescript
// Using Application Default Credentials (ADC)
// Set GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CLOUD_PROJECT env vars
const voice = new GoogleVoice({
  vertexAI: true,
  project: 'your-gcp-project',
  location: 'us-central1', // Optional, defaults to 'us-central1'
})

// Using service account key file
const voice = new GoogleVoice({
  vertexAI: true,
  project: 'your-gcp-project',
  speechModel: {
    keyFilename: '/path/to/service-account.json',
  },
  listeningModel: {
    keyFilename: '/path/to/service-account.json',
  },
})

// Using in-memory credentials
const voice = new GoogleVoice({
  vertexAI: true,
  project: 'your-gcp-project',
  speechModel: {
    credentials: {
      client_email: 'service-account@project.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
    },
  },
})
```

#### Required Permissions

#### IAM Roles

For Text-to-Speech:

- `roles/texttospeech.admin` - Text-to-Speech Admin (full access)
- `roles/texttospeech.editor` - Text-to-Speech Editor (create and manage)
- `roles/texttospeech.viewer` - Text-to-Speech Viewer (read-only)

For Speech-to-Text:

- `roles/speech.client` - Speech-to-Text Client

Grant `roles/speech.client` to the service account whose credentials the request presents (via `keyFilename`, `credentials`, or `GOOGLE_APPLICATION_CREDENTIALS`). This role is required for `listen({ v2: true })` specifically, not only for Vertex AI mode. Granting it to a user account has no effect on API-key-only requests, which carry no identity to authorize.

#### OAuth Scopes

For synchronous Text-to-Speech synthesis:

- `https://www.googleapis.com/auth/cloud-platform` - Full access to Google Cloud Platform services

For long-audio Text-to-Speech operations:

- `locations.longAudioSynthesize` - Create long-audio synthesis operations
- `operations.get` - Get operation status
- `operations.list` - List operations

## Important notes

1. **Authentication**: Either a Google Cloud API key (standard mode) or service account credentials (Vertex AI mode) is required.

2. **Environment Variables**:

   - `GOOGLE_API_KEY` - API key for standard mode
   - `GOOGLE_CLOUD_PROJECT` - Project ID for Vertex AI mode
   - `GOOGLE_CLOUD_LOCATION` - Location for Vertex AI mode (defaults to 'us-central1')
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account key file

3. The default voice is set to `'en-US-Casual-K'`.

4. Both text-to-speech and speech-to-text services use LINEAR16 as the default audio encoding.

5. The `speak()` method supports advanced audio configuration through the Google Cloud Text-to-Speech API.

6. The `listen()` method supports various recognition configurations through the Google Cloud Speech-to-Text API.

7. `listen({ v2: true })` requires service account credentials and `GOOGLE_CLOUD_PROJECT`; it fails with `PERMISSION_DENIED` when only `GOOGLE_API_KEY` is set. `speak()` and v1 `listen()` work with an API key alone.

8. Available voices can be filtered by language code using the `getSpeakers()` method.

9. Vertex AI mode provides enterprise features including IAM control, audit logs, and project-level billing.