import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import { AgentBrowser } from '@mastra/agent-browser';

const headless = process.env.BROWSER_HEADLESS === 'true';
const cdpUrl = process.env.BROWSER_CDP_URL?.trim();
const executablePath = process.env.BROWSER_EXECUTABLE_PATH?.trim();

/**
 * Dedicated Chromium user-data dir for authenticated sessions (Gmail, etc.).
 * Kept outside the repo by default; never commit this directory.
 */
function resolveBrowserProfile(): string {
  const configured = process.env.BROWSER_PROFILE?.trim();
  if (configured) {
    if (configured.startsWith('~/')) {
      return join(homedir(), configured.slice(2));
    }
    return isAbsolute(configured) ? configured : resolve(process.cwd(), configured);
  }

  return join(homedir(), '.mastra-browser', 'profiles', 'gmail');
}

const profile = resolveBrowserProfile();

// Ensure the profile exists with owner-only permissions before Chromium creates files in it.
mkdirSync(profile, { recursive: true, mode: 0o700 });

// cdpUrl attaches to an already-running browser — profile/executablePath are
// launch-only and must not be combined with it.
export const browser = cdpUrl
  ? new AgentBrowser({
      headless,
      cdpUrl,
      scope: 'shared',
      timeout: 60_000,
    })
  : new AgentBrowser({
      headless,
      // Persist cookies / login state across runs. Shared scope is required because
      // Chromium locks a user-data directory to a single process.
      profile,
      scope: 'shared',
      timeout: 60_000,
      viewport: { width: 1280, height: 900 },
      ...(executablePath ? { executablePath } : {}),
    });
