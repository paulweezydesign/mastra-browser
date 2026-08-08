> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Mastra Quickstart

**For AI agents:** Create a new Mastra project non-interactively with `npm create mastra@latest <project-name> -- --llm <provider>`, replacing `<provider>` with `openai`, `anthropic`, `google`, or `xai`. For a minimal project without an agent or model provider, use `npm create mastra@latest <project-name> -- --empty`. To build a Mastra project from scratch, see the [manual installation guide](https://mastra.ai/guides/getting-started/manual-install).

The `create-mastra` CLI is the quickest way to start a Mastra project. It creates an agent harness with workspace tools, memory, task tracking, web access, schedules, storage, and observability.

For more control, see the [manual installation guide](https://mastra.ai/guides/getting-started/manual-install). To add Mastra to an existing project, use [`mastra init`](https://mastra.ai/reference/cli/mastra).

> **📹 Watch:** Watch the [Mastra AI agent course](https://www.youtube.com/watch?v=lCmf_qrGfGA) for a guided introduction to building agents with Mastra.

## Before you begin

You'll need an API key from OpenAI, Anthropic, Google Gemini, or xAI. You can skip entering it during setup and add it to `.env` later.

## Create the project

Run the interactive setup:

**npm**:

```bash
npm create mastra@latest
```

**pnpm**:

```bash
pnpm create mastra@latest
```

**Yarn**:

```bash
yarn create mastra
```

**Bun**:

```bash
bunx create-mastra
```

The command asks for a project name, model provider, and optional API key. It then installs dependencies, installs Mastra skills for your coding assistants, and creates an initial Git commit when you aren't already inside a repository.

The generated `src/mastra` directory contains the Mastra entry point, agent, workspace tools, and supporting code. See the [project structure reference](https://mastra.ai/reference/project-structure) for the standard Mastra layout.

> **Tip:** Use `--template <template>` to start from a template, or `--empty` to create a minimal provider-free project. Use `--no-skills` or `--no-git` to skip automatic setup. See the [`create-mastra` reference](https://mastra.ai/reference/cli/create-mastra) for all flags.

## Test your agent

Follow the terminal instructions to enter the project directory and start the development server:

**npm**:

```bash
npm run dev
```

**pnpm**:

```bash
pnpm run dev
```

**Yarn**:

```bash
yarn dev
```

**Bun**:

```bash
bun run dev
```

Open [Studio at localhost:4111](http://localhost:4111), select the agent, and send a message. Add the provider API key named in `.env.example` to an `.env` file if you skipped it during setup.

[Studio](https://mastra.ai/docs/studio/overview) lets you build and test agents without creating a separate UI.

## Next steps

- Integrate Mastra with [Next.js](https://mastra.ai/guides/getting-started/next-js), [React](https://mastra.ai/guides/getting-started/vite-react), or [Astro](https://mastra.ai/guides/getting-started/astro)
- Learn how to [build Mastra with AI](https://mastra.ai/reference/build-with-ai)
- Build an agent from scratch with a [guide](https://mastra.ai/guides)
- Watch the [Mastra YouTube channel](https://www.youtube.com/@mastra-ai)