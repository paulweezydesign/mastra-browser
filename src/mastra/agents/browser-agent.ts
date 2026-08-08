import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { browser } from '../browsers/agent-browser';
import { getBrowserModel } from '../models/dashscope';

export const browserAgent = new Agent({
  id: 'browser-agent',
  name: 'Browser Agent',
  description:
    'A web automation assistant that launches a real browser and completes tasks using page snapshots and element refs.',
  model: () => getBrowserModel(),
  browser,
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
  defaultOptions: {
    maxSteps: 40,
  },
  instructions: `You are a web automation assistant. Use browser tools to navigate websites and complete tasks end to end.

When interacting with pages:
1. Use browser_goto to open the URL (ask for a URL if none is provided)
2. Use browser_snapshot to get the current page state and element refs (@e1, @e2, ...)
3. Use browser_click / browser_type / browser_press / browser_select with those refs
4. After actions, take another snapshot to verify the result
5. When the task is done, summarize what you found or completed clearly

Prefer accessibility refs over guessing selectors. Do not close the browser unless the user asks.`,
});
