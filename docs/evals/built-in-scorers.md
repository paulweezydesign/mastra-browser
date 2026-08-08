> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Built-in scorers

Mastra provides a complete set of built-in scorers for evaluating AI outputs. These scorers are optimized for common evaluation scenarios and are ready to use in your agents and workflows.

To create your own scorers, see the [Custom Scorers](https://mastra.ai/docs/evals/custom-scorers) guide.

## Available scorers

### Accuracy and reliability

These scorers evaluate how correct, truthful, and complete your agent's answers are:

- [`answer-relevancy`](https://mastra.ai/reference/evals/answer-relevancy): Evaluates how well responses address the input query (`0-1`, higher is better)
- [`answer-similarity`](https://mastra.ai/reference/evals/answer-similarity): Compares agent outputs against ground-truth answers for CI/CD testing using semantic analysis (`0-1`, higher is better)
- [`faithfulness`](https://mastra.ai/reference/evals/faithfulness): Measures how accurately responses represent provided context (`0-1`, higher is better)
- [`hallucination`](https://mastra.ai/reference/evals/hallucination): Detects factual contradictions and unsupported claims (`0-1`, lower is better)
- [`completeness`](https://mastra.ai/reference/evals/completeness): Checks if responses include all necessary information (`0-1`, higher is better)
- [`content-similarity`](https://mastra.ai/reference/evals/content-similarity): Measures textual similarity using character-level matching (`0-1`, higher is better)
- [`textual-difference`](https://mastra.ai/reference/evals/textual-difference): Measures textual differences between strings (`0-1`, higher means more similar)
- [`tool-call-accuracy`](https://mastra.ai/reference/evals/tool-call-accuracy): Evaluates whether the LLM selects the correct tool from available options (`0-1`, higher is better)
- [`trajectory-accuracy`](https://mastra.ai/reference/evals/trajectory-accuracy): Evaluates the expected action sequence for all span types. Covered spans include tool and model activity plus workflow steps (`0-1`, higher is better)
- [`prompt-alignment`](https://mastra.ai/reference/evals/prompt-alignment): Measures how well agent responses align with user prompt intent, requirements, completeness, and format (`0-1`, higher is better)

### Context quality

These scorers evaluate the quality and relevance of context used in generating responses:

- [`context-precision`](https://mastra.ai/reference/evals/context-precision): Uses Mean Average Precision to evaluate context ranking. Relevant context receives a higher score when it occurs early (`0-1`, higher is better)
- [`context-relevance`](https://mastra.ai/reference/evals/context-relevance): Measures context utility through relevance levels and usage tracking. It also detects missing context (`0-1`, higher is better)

> **Context Scorer Selection:**
>
> - Use **Context Precision** when context ordering matters and you need standard IR metrics (ideal for RAG ranking evaluation)
> - Use **Context Relevance** when you need detailed relevance assessment and want to track context usage and identify gaps
>
> Both context scorers support:
>
> - **Static context**: Pre-defined context arrays
> - **Dynamic context extraction**: Extract context from runs using custom functions (ideal for RAG systems, vector databases, etc.)

### Output quality

These scorers evaluate adherence to format, style, and safety requirements:

- [`tone-consistency`](https://mastra.ai/reference/evals/tone-consistency): Measures consistency in formality, complexity, and style (`0-1`, higher is better)
- [`toxicity`](https://mastra.ai/reference/evals/toxicity): Detects harmful or inappropriate content (`0-1`, lower is better)
- [`bias`](https://mastra.ai/reference/evals/bias): Detects potential biases in the output (`0-1`, lower is better)
- [`keyword-coverage`](https://mastra.ai/reference/evals/keyword-coverage): Assesses technical terminology usage (`0-1`, higher is better)

### Quick Checks

Zero-LLM micro-scorers for fast, deterministic assertions. See the [Quick Checks](https://mastra.ai/docs/evals/quick-checks) guide for usage details.

- [`checks.includes`](https://mastra.ai/reference/evals/checks): Scores 1 if output contains a substring (`0` or `1`)
- [`checks.excludes`](https://mastra.ai/reference/evals/checks): Scores 1 if output doesn't contain a substring (`0` or `1`)
- [`checks.equals`](https://mastra.ai/reference/evals/checks): Scores 1 if output exactly matches a string (`0` or `1`)
- [`checks.matches`](https://mastra.ai/reference/evals/checks): Scores 1 if output matches a regex (`0` or `1`)
- [`checks.similarity`](https://mastra.ai/reference/evals/checks): String similarity via Dice coefficient (`0-1`, or binary with threshold)
- [`checks.calledTool`](https://mastra.ai/reference/evals/checks): Scores 1 if a tool was called at least N times (`0` or `1`)
- [`checks.didNotCall`](https://mastra.ai/reference/evals/checks): Scores 1 if a tool wasn't called (`0` or `1`)
- [`checks.toolOrder`](https://mastra.ai/reference/evals/checks): Scores 1 if tools were called in order (`0` or `1`)
- [`checks.maxToolCalls`](https://mastra.ai/reference/evals/checks): Scores 1 if tool call count is within limit (`0` or `1`)
- [`checks.usedNoTools`](https://mastra.ai/reference/evals/checks): Scores 1 if no tools were called (`0` or `1`)
- [`checks.noToolErrors`](https://mastra.ai/reference/evals/checks): Scores 1 if no tool calls had errors (`0` or `1`)