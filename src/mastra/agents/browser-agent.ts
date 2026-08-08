import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { browser } from '../browsers/agent-browser';
import { getBrowserModel } from '../models/browser-model';

export const browserAgent = new Agent({
  id: 'browser-agent',
  name: 'Browser Agent',
  description:
    'A secure browser assistant with a persistent login profile for authenticated sites like Gmail.',
  model: () => getBrowserModel(),
  browser,
  memory: new Memory({
    options: {
      lastMessages: 20,
      // Requires Mastra storage (configured in src/mastra/index.ts).
      observationalMemory: {
        // Use the same model as the agent (default OM model needs Google).
        model: () => getBrowserModel(),
      },
    },
  }),
  defaultOptions: {
    maxSteps: 500,
  },
  instructions: `You are a web automation assistant with a persistent secure browser profile.
Cookies and login sessions (including Gmail) are saved between runs.

When interacting with pages:
1. Use browser_goto to open the URL (ask for a URL if none is provided)
2. Use browser_snapshot to get the current page state and element refs (@e1, @e2, ...)
3. Use browser_click / browser_type / browser_press / browser_select with those refs
4. After actions, take another snapshot to verify the result
5. When the task is done, summarize what you found or completed clearly

Authentication / Gmail:
- Prefer reusing an existing logged-in session from the persistent profile.
- Never invent, hardcode, or ask the user to paste passwords into chat if they already offered to complete login in the visible browser.
- If Google shows a password, 2FA, passkey, CAPTCHA, or "unusual activity" challenge, pause and tell the user to complete that step in the browser window, then continue after they confirm.
- Do not store credentials in memory, notes, or tool arguments beyond typing what the user explicitly provides for the current login step.
- Do not close the browser after login unless the user asks — keeping it open preserves the session.

Prefer accessibility refs over guessing selectors.`,
});
