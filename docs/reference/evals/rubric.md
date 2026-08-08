> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Rubric scorer

**Added in:** `@mastra/evals@1.3.0`

The `createRubricScorer()` function creates an LLM-as-judge scorer that grades an agent's output against a rubric (a checklist of criteria). It returns a **binary** score: `1` only when every required criterion is satisfied, otherwise `0`. The `reason` lists each criterion's verdict so the agent knows exactly what to fix.

This scorer is designed to drop into [`isTaskComplete`](https://mastra.ai/reference/streaming/agents/stream). Because `isTaskComplete` treats `score === 1` as "task complete" and injects the `reason` back into the conversation as feedback, the agent keeps iterating until the rubric is satisfied (or `maxSteps` is reached).

## Parameters

**model** (`MastraModelConfig`): The language model used to grade the output against the rubric. A smaller, cheaper model is usually sufficient for grading.

**criteria** (`RubricCriterion[] | string`): The rubric to grade against. A string is treated as a newline-delimited checklist (each line becomes a required criterion). If omitted, the rubric is read at run time from a rubric value on request/additional context; if none resolves, the scorer is a no-op and returns 1.

**options** (`RubricScorerOptions`): Configuration options for the scorer

## `.run()` returns

**score** (`number`): 1 when every required criterion is satisfied, otherwise 0 (multiplied by scale).

**reason** (`string`): A per-criterion explanation listing which criteria are met or unmet and why. This is the text that isTaskComplete injects back into the conversation as feedback.

## Usage with isTaskComplete

Define the rubric once, attach the scorer to `isTaskComplete`, and the agent self-corrects until the rubric is satisfied:

```typescript
import { Agent } from '@mastra/core/agent'
import { createRubricScorer } from '@mastra/evals/scorers/prebuilt'

const supervisor = new Agent({
  id: 'supervisor',
  instructions: `You coordinate research and writing using specialized agents. Delegate to research-agent for facts, then writing-agent for content.`,
  model: 'openai/gpt-5.6-sol',
  agents: { researchAgent, writingAgent },
})

const rubricScorer = createRubricScorer({
  model: 'openai/gpt-5-mini',
  criteria: [
    { description: 'The response includes an analysis section' },
    { description: 'The response includes concrete recommendations' },
  ],
})

const stream = await supervisor.stream('Research AI in education', {
  maxSteps: 10,
  isTaskComplete: {
    scorers: [rubricScorer],
    strategy: 'all',
  },
})
```

## String rubric

A newline-delimited string is parsed into criteria, with common list markers (`-`, `*`, `1.`) stripped. Every line becomes a required criterion:

```typescript
const rubricScorer = createRubricScorer({
  model: 'openai/gpt-5-mini',
  criteria: `- All tests pass in the test suite
- The function is named find_duplicates and accepts a single list argument`,
})
```

## Optional criteria

Mark a criterion as optional to have it graded and reported without gating completion:

```typescript
const rubricScorer = createRubricScorer({
  model: 'openai/gpt-5-mini',
  criteria: [
    { description: 'Includes an analysis section', required: true },
    { description: 'Includes citations', required: false },
  ],
})
```

## Dynamic rubric per run

When no `criteria` is passed to the factory, the scorer resolves a `rubric` value from the run's request context, additional context, or input. This lets a single scorer instance grade different rubrics per run without rebuilding it:

```typescript
const rubricScorer = createRubricScorer({
  model: 'openai/gpt-5-mini',
})

await supervisor.stream('Write find_duplicates', {
  isTaskComplete: { scorers: [rubricScorer] },
  requestContext: {
    rubric: '- All tests pass\n- The function is named find_duplicates',
  },
})
```

If no rubric resolves, the scorer returns `1` and doesn't gate the loop.

## Scoring details

The scorer runs in two phases:

1. **Grade**: The judge model evaluates each criterion independently and returns a per-criterion verdict (`satisfied` / not) with reasoning.
2. **Score**: The result is `1` only when every required criterion is `satisfied`, otherwise `0`. If no criteria are marked required, all criteria are treated as required.

The `reason` summarizes the result and lists each criterion with its verdict, so a failing grade gives the agent targeted, useful feedback rather than a generic "try again".

## Related

- [isTaskComplete on stream()](https://mastra.ai/reference/streaming/agents/stream)
- [Supervisor agents](https://mastra.ai/docs/capabilities/subagents)
- [createScorer](https://mastra.ai/reference/evals/create-scorer)