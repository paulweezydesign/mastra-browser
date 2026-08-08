# Mastra Browser Agent

Local Mastra agent that launches Chromium via `@mastra/agent-browser` and completes web tasks. Inference runs through **Alibaba Cloud Model Studio (DashScope)**.

## Prerequisites

- Node.js 22.13+
- Alibaba Model Studio API key (`DASHSCOPE_API_KEY`)
- Playwright Chromium (installed during setup)

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Edit `.env` and set `DASHSCOPE_API_KEY`. Use the China DashScope base URL if your key is China-region:

```bash
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

## Models

| `BROWSER_MODEL` | DashScope model id | Notes |
| --- | --- | --- |
| `qwen` (default) | `qwen3.7-max` | Override with `DASHSCOPE_MODEL_ID=qwen3.8-max` if needed |
| `glm` | `glm-5.2` | Z.AI / GLM via DashScope |
| `kimi` | `kimi-k2.7-code` | Kimi coding model |

Change models by editing `.env` and restarting the dev server.

## Run

```bash
npm run dev
```

Open [Studio](http://localhost:4111), select **Browser Agent**, and try:

- Open https://news.ycombinator.com and list the top 3 stories.
- Go to https://example.com and tell me the page title and main heading.

With `BROWSER_HEADLESS=false`, Chromium opens on your machine so you can watch the agent click around.

## Project layout

- `src/mastra/models/dashscope.ts` — DashScope model selection
- `src/mastra/browsers/agent-browser.ts` — Playwright `AgentBrowser` instance
- `src/mastra/agents/browser-agent.ts` — agent + Memory + browser tools
- `src/mastra/index.ts` — Mastra entry point with LibSQL storage (`mastra.db`)

Browser sessions require Mastra Memory (thread + resource). Studio provides these automatically when you chat with the agent.
