import { AgentBrowser } from '@mastra/agent-browser';

const headless = process.env.BROWSER_HEADLESS === 'true';
const cdpUrl = process.env.BROWSER_CDP_URL?.trim();

export const browser = cdpUrl
  ? new AgentBrowser({
      headless,
      cdpUrl,
      scope: 'shared',
    })
  : new AgentBrowser({
      headless,
    });
