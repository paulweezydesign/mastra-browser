import type { OpenAICompatibleConfig } from '@mastra/core/llm';

export type BrowserModelAlias = 'qwen' | 'glm' | 'kimi';

const DEFAULT_DASHSCOPE_BASE_URL =
  'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

const MODEL_IDS: Record<BrowserModelAlias, string> = {
  // Override with DASHSCOPE_MODEL_ID=qwen3.8-max if your console uses that id.
  qwen: 'qwen3.7-max',
  glm: 'glm-5.2',
  kimi: 'kimi-k2.7-code',
};

function resolveBrowserModelAlias(value: string | undefined): BrowserModelAlias {
  switch (value) {
    case undefined:
    case '':
    case 'qwen':
      return 'qwen';
    case 'glm':
      return 'glm';
    case 'kimi':
      return 'kimi';
    default: {
      const allowed = Object.keys(MODEL_IDS).join(', ');
      throw new Error(
        `Invalid BROWSER_MODEL="${value}". Expected one of: ${allowed}.`,
      );
    }
  }
}

export function resolveDashScopeModelId(): string {
  const override = process.env.DASHSCOPE_MODEL_ID?.trim();
  if (override) {
    return override;
  }

  const alias = resolveBrowserModelAlias(process.env.BROWSER_MODEL);
  return MODEL_IDS[alias];
}

/**
 * OpenAI-compatible DashScope config for Mastra's model router.
 * Uses providerId/modelId so raw DashScope ids (without a slash) work.
 */
export function getDashScopeBrowserModel(): OpenAICompatibleConfig {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'DASHSCOPE_API_KEY is required when MODEL_PROVIDER=dashscope. Copy .env.example to .env and set your Alibaba Model Studio key.',
    );
  }

  return {
    providerId: 'alibaba',
    modelId: resolveDashScopeModelId(),
    url: process.env.DASHSCOPE_BASE_URL ?? DEFAULT_DASHSCOPE_BASE_URL,
    apiKey,
  };
}
