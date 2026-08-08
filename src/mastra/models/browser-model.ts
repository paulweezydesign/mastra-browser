import type { OpenAICompatibleConfig } from '@mastra/core/llm';
import { getDashScopeBrowserModel } from './dashscope';

export type ModelProvider = 'lmstudio' | 'dashscope';

const DEFAULT_LMSTUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
const DEFAULT_LMSTUDIO_MODEL_ID = 'qwen/qwen3-next-80b';

function resolveModelProvider(value: string | undefined): ModelProvider {
  switch (value) {
    case undefined:
    case '':
    case 'lmstudio':
      return 'lmstudio';
    case 'dashscope':
      return 'dashscope';
    default: {
      throw new Error(
        `Invalid MODEL_PROVIDER="${value}". Expected one of: lmstudio, dashscope.`,
      );
    }
  }
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
 * Defaults to local LM Studio; set MODEL_PROVIDER=dashscope for Alibaba.
 */
export function getBrowserModel(): OpenAICompatibleConfig {
  const provider = resolveModelProvider(process.env.MODEL_PROVIDER);

  switch (provider) {
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
