import type { OpenAICompatibleConfig } from '@mastra/core/llm';
import { getDashScopeBrowserModel } from './dashscope';

export type ModelProvider = 'ollama' | 'lmstudio' | 'dashscope';

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434/v1';
const DEFAULT_OLLAMA_MODEL_ID = 'qwen3-next:80b-a3b-thinking-q8_0';

const DEFAULT_LMSTUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
const DEFAULT_LMSTUDIO_MODEL_ID = 'qwen/qwen3-next-80b';

function resolveModelProvider(value: string | undefined): ModelProvider {
  switch (value) {
    case undefined:
    case '':
    case 'ollama':
      return 'ollama';
    case 'lmstudio':
      return 'lmstudio';
    case 'dashscope':
      return 'dashscope';
    default: {
      throw new Error(
        `Invalid MODEL_PROVIDER="${value}". Expected one of: ollama, lmstudio, dashscope.`,
      );
    }
  }
}

function getOllamaBrowserModel(): OpenAICompatibleConfig {
  return {
    providerId: 'ollama',
    modelId: process.env.OLLAMA_MODEL_ID?.trim() || DEFAULT_OLLAMA_MODEL_ID,
    url: process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_OLLAMA_BASE_URL,
    // Ollama ignores the key, but OpenAI-compatible clients often require one.
    apiKey: process.env.OLLAMA_API_KEY?.trim() || 'ollama',
  };
}

function getLmStudioBrowserModel(): OpenAICompatibleConfig {
  const apiKey = process.env.LMSTUDIO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'LMSTUDIO_API_KEY is required when MODEL_PROVIDER=lmstudio. Set it in .env.',
    );
  }

  return {
    providerId: 'lmstudio',
    modelId:
      process.env.LMSTUDIO_MODEL_ID?.trim() || DEFAULT_LMSTUDIO_MODEL_ID,
    url: process.env.LMSTUDIO_BASE_URL?.trim() || DEFAULT_LMSTUDIO_BASE_URL,
    apiKey,
  };
}

/**
 * Resolve the browser agent model from MODEL_PROVIDER.
 * Defaults to local Ollama; use lmstudio or dashscope to switch.
 */
export function getBrowserModel(): OpenAICompatibleConfig {
  const provider = resolveModelProvider(process.env.MODEL_PROVIDER);

  switch (provider) {
    case 'ollama':
      return getOllamaBrowserModel();
    case 'lmstudio':
      return getLmStudioBrowserModel();
    case 'dashscope':
      return getDashScopeBrowserModel();
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unhandled MODEL_PROVIDER: ${_exhaustive}`);
    }
  }
}
