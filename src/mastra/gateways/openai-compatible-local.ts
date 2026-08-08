import {
  MastraModelGateway,
  ModelRouterLanguageModel,
  type GatewayLanguageModel,
  type ProviderConfig,
} from '@mastra/core/llm';

type LocalOpenAIGatewayOptions = {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  baseUrl: string;
  apiKeyEnvVar: string;
  /** Fallback API key when the env var is unset (Ollama accepts any value). */
  defaultApiKey?: string;
};

type OpenAIModelsResponse = {
  data?: Array<{ id?: string }>;
};

/**
 * Encode model ids that contain `/` so Studio's gateway/provider/model
 * path stays unambiguous (e.g. LM Studio's `qwen/qwen3-next-80b`).
 */
function encodeModelId(modelId: string): string {
  return modelId.replaceAll('/', '__');
}

function decodeModelId(modelId: string): string {
  return modelId.replaceAll('__', '/');
}

async function listOpenAICompatibleModels(
  baseUrl: string,
  apiKey: string,
): Promise<string[]> {
  const url = `${baseUrl.replace(/\/$/, '')}/models`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list models from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as OpenAIModelsResponse;
  return (body.data ?? [])
    .map((model) => model.id?.trim())
    .filter((id): id is string => Boolean(id))
    .map(encodeModelId);
}

/**
 * OpenAI-compatible local gateway (Ollama, LM Studio, etc.).
 * `fetchProviders()` hits `/v1/models` so Studio shows what's actually loaded.
 */
export class OpenAICompatibleLocalGateway extends MastraModelGateway {
  readonly id: string;
  readonly name: string;
  private readonly providerId: string;
  private readonly providerName: string;
  private readonly baseUrl: string;
  private readonly apiKeyEnvVar: string;
  private readonly defaultApiKey?: string;

  constructor(options: LocalOpenAIGatewayOptions) {
    super();
    this.id = options.id;
    this.name = options.name;
    this.providerId = options.providerId;
    this.providerName = options.providerName;
    this.baseUrl = options.baseUrl;
    this.apiKeyEnvVar = options.apiKeyEnvVar;
    this.defaultApiKey = options.defaultApiKey;
  }

  async fetchProviders(): Promise<Record<string, ProviderConfig>> {
    let models: string[] = [];
    try {
      models = await listOpenAICompatibleModels(
        this.baseUrl,
        await this.getApiKey(`${this.id}/${this.providerId}`),
      );
    } catch (error) {
      // Keep the gateway visible in Studio even if the server is temporarily down.
      console.warn(
        `[${this.id}] Could not list local models from ${this.baseUrl}:`,
        error instanceof Error ? error.message : error,
      );
    }

    return {
      [this.providerId]: {
        name: this.providerName,
        models,
        apiKeyEnvVar: this.apiKeyEnvVar,
        gateway: this.id,
        url: this.baseUrl,
      },
    };
  }

  buildUrl(_modelId: string, _envVars: Record<string, string>): string {
    return this.baseUrl;
  }

  async getApiKey(_modelId: string): Promise<string> {
    const fromEnv = process.env[this.apiKeyEnvVar]?.trim();
    if (fromEnv) {
      return fromEnv;
    }
    if (this.defaultApiKey) {
      return this.defaultApiKey;
    }
    throw new Error(`Missing ${this.apiKeyEnvVar} environment variable`);
  }

  async resolveLanguageModel({
    modelId,
    providerId,
    apiKey,
  }: {
    modelId: string;
    providerId: string;
    apiKey: string;
  }): Promise<GatewayLanguageModel> {
    // ModelRouterLanguageModel is the runtime router; cast keeps gateway typing happy.
    return new ModelRouterLanguageModel({
      providerId,
      modelId: decodeModelId(modelId),
      url: this.baseUrl,
      apiKey,
    }) as unknown as GatewayLanguageModel;
  }
}

export function createOllamaGateway(): OpenAICompatibleLocalGateway {
  return new OpenAICompatibleLocalGateway({
    id: 'ollama',
    name: 'Ollama (local)',
    providerId: 'local',
    providerName: 'Ollama',
    baseUrl: process.env.OLLAMA_BASE_URL?.trim() || 'http://127.0.0.1:11434/v1',
    apiKeyEnvVar: 'OLLAMA_API_KEY',
    defaultApiKey: 'ollama',
  });
}

export function createLmStudioGateway(): OpenAICompatibleLocalGateway {
  return new OpenAICompatibleLocalGateway({
    id: 'lmstudio',
    name: 'LM Studio (local)',
    providerId: 'local',
    providerName: 'LM Studio',
    baseUrl:
      process.env.LMSTUDIO_BASE_URL?.trim() || 'http://127.0.0.1:1234/v1',
    apiKeyEnvVar: 'LMSTUDIO_API_KEY',
  });
}
