> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Quick Checks

Quick Checks are zero-LLM, composable micro-scorers for common assertions. They plug into the existing `scorers: [...]` array anywhere scorers are used: in `runEvals`, live scoring, experiments, and Studio.

Internally they're standard `createScorer()` instances, so they have the same observability, storage, and pipeline integration as any other scorer.

## Usage example

```typescript
import { checks } from '@mastra/evals/checks'
import { runEvals } from '@mastra/core/evals'
import { myAgent } from '../agents'

const result = await runEvals({
  data: [{ input: 'What is the weather in Brooklyn?' }],
  target: myAgent,
  scorers: [
    checks.includes('sunny'),
    checks.calledTool('get_weather'),
    checks.toolOrder(['get_weather', 'summarize']),
    checks.noToolErrors(),
  ],
})

console.log(result.scores)
```

## Text checks

### `checks.includes(expected, options?)`

Scores 1 if the agent's output text contains the expected substring, 0 otherwise.

```typescript
checks.includes('sunny')
checks.includes('Sunny', { ignoreCase: false })
```

**expected** (`string`): Substring to search for in the output.

**options.ignoreCase** (`boolean`): Case-insensitive matching. (Default: `true`)

Returns: `1` if found, `0` otherwise.

### `checks.excludes(unwanted, options?)`

Scores 1 if the agent's output text doesn't contain the substring, 0 otherwise.

```typescript
checks.excludes('error')
checks.excludes('Error', { ignoreCase: false })
```

**unwanted** (`string`): Substring that must not appear in the output.

**options.ignoreCase** (`boolean`): Case-insensitive matching. (Default: `true`)

Returns: `1` if absent, `0` otherwise.

### `checks.equals(expected, options?)`

Scores 1 if the output text exactly equals the expected string after optional normalization.

```typescript
checks.equals('Hello, world!')
checks.equals('Hello', { ignoreCase: false })
```

**expected** (`string`): Exact string the output must match.

**options.ignoreCase** (`boolean`): Case-insensitive matching. (Default: `true`)

Returns: `1` if equal, `0` otherwise.

### `checks.matches(pattern, options?)`

Scores 1 if the output matches the regular expression.

```typescript
checks.matches(/\d+°[FC]/)
checks.matches(/^hello$/, { exact: true })
```

**pattern** (`RegExp`): Regular expression to test against the output.

**options.exact** (`boolean`): Anchor the pattern to match the entire output (adds ^ and $). (Default: `false`)

Returns: `1` if matched, `0` otherwise.

### `checks.similarity(expected, options?)`

Returns the string similarity score (0-1) between the output and an expected string using the Dice coefficient. When a `threshold` is set, returns binary 1/0 instead.

```typescript
checks.similarity('Sunny, 72°F')
checks.similarity('Sunny, 72°F', { threshold: 0.7 })
```

**expected** (`string`): Reference string to compare against.

**options.threshold** (`number`): Minimum similarity score (0-1) to return 1. When omitted, returns the raw similarity score.

**options.ignoreCase** (`boolean`): Case-insensitive comparison. (Default: `true`)

Returns: Raw similarity score (0-1), or binary `1`/`0` when `threshold` is set.

## Tool call checks

### `checks.calledTool(toolName, options?)`

Scores 1 if the agent called the specified tool at least the required number of times.

```typescript
checks.calledTool('get_weather')
checks.calledTool('search', { times: 2 })
```

**toolName** (`string`): Name of the tool to look for.

**options.times** (`number`): Minimum number of times the tool must be called. (Default: `1`)

Returns: `1` if called at least `times` times, `0` otherwise.

### `checks.didNotCall(toolName)`

Scores 1 if the agent didn't call the specified tool.

```typescript
checks.didNotCall('delete_user')
```

**toolName** (`string`): Name of the tool that must not appear.

Returns: `1` if the tool wasn't called, `0` otherwise.

### `checks.toolOrder(expectedOrder)`

Scores 1 if the tools were called in the specified order. Uses relaxed matching. Other tool calls between the expected tools are allowed.

```typescript
checks.toolOrder(['search', 'summarize', 'respond'])
```

**expectedOrder** (`string[]`): Tool names in the expected calling sequence. Must appear as a subsequence of the actual tool calls.

Returns: `1` if the expected order is satisfied, `0` otherwise.

### `checks.maxToolCalls(max)`

Scores 1 if the agent used no more than `max` tool calls.

```typescript
checks.maxToolCalls(5)
```

**max** (`number`): Maximum number of tool calls allowed.

Returns: `1` if within the limit, `0` otherwise.

### `checks.usedNoTools()`

Scores 1 if the agent made no tool calls at all.

```typescript
checks.usedNoTools()
```

Returns: `1` if no tools were called, `0` otherwise.

### `checks.noToolErrors()`

Scores 1 if none of the tool invocations resulted in an error state. Detects both error results (`result.error` present) and incomplete tool calls (`state === 'call'`).

```typescript
checks.noToolErrors()
```

Returns: `1` if all tool calls succeeded, `0` otherwise.

## Combining checks with other scorers

Checks compose with LLM-based and code-based scorers in the same `scorers` array:

```typescript
import { checks } from '@mastra/evals/checks'
import { createAnswerRelevancyScorer } from '@mastra/evals/scorers/prebuilt'
import { runEvals } from '@mastra/core/evals'
import { myAgent } from '../agents'

const result = await runEvals({
  data: [{ input: 'What is the weather in Brooklyn?' }],
  target: myAgent,
  scorers: [
    // Zero-LLM checks
    checks.includes('Brooklyn'),
    checks.calledTool('get_weather'),
    checks.noToolErrors(),
    // LLM-based scorer
    createAnswerRelevancyScorer({ model: 'openai/gpt-5-mini' }),
  ],
})
```

## Related

- [Quick Checks overview](https://mastra.ai/docs/evals/quick-checks)
- [Built-in Scorers](https://mastra.ai/docs/evals/built-in-scorers)
- [`createScorer()` reference](https://mastra.ai/reference/evals/create-scorer)
- [`runEvals()` reference](https://mastra.ai/reference/evals/run-evals)
- [Custom Scorers](https://mastra.ai/docs/evals/custom-scorers)