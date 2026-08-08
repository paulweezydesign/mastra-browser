import type {
  Processor,
  ProcessLLMRequestArgs,
  ProcessLLMRequestResult,
} from '@mastra/core/processors';

type Prompt = ProcessLLMRequestArgs['prompt'];

/**
 * Local GGUF chat templates (Qwen/Qwythos via LM Studio/Ollama) reject prompts
 * where a `system` message appears after user/assistant/tool turns:
 * "System message must be at the beginning."
 *
 * Mastra can inject multiple system messages (instructions, memory, Studio
 * context). This processor merges them into one leading system message on the
 * outbound prompt only — history is left unchanged.
 */
export class SystemMessageFirstProcessor implements Processor<'system-message-first'> {
  readonly id = 'system-message-first' as const;
  readonly name = 'System Message First';

  processLLMRequest({
    prompt,
  }: ProcessLLMRequestArgs): ProcessLLMRequestResult {
    const fixed = coerceSystemMessagesFirst(prompt);
    if (fixed === prompt) {
      return {};
    }
    return { prompt: fixed };
  }
}

function coerceSystemMessagesFirst(prompt: Prompt): Prompt {
  const systemMessages = prompt.filter((message) => message.role === 'system');
  const otherMessages = prompt.filter((message) => message.role !== 'system');

  if (systemMessages.length === 0) {
    return prompt;
  }

  let seenNonSystem = false;
  let hasMidThreadSystem = false;
  for (const message of prompt) {
    if (message.role === 'system') {
      if (seenNonSystem) {
        hasMidThreadSystem = true;
        break;
      }
    } else {
      seenNonSystem = true;
    }
  }

  // Already a single leading system message — nothing to do.
  if (!hasMidThreadSystem && systemMessages.length === 1) {
    return prompt;
  }

  const mergedText = systemMessages
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join('\n\n');

  if (!mergedText) {
    return otherMessages;
  }

  return [{ role: 'system', content: mergedText }, ...otherMessages];
}
