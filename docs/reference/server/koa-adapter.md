> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Koa adapter

The `@mastra/koa` package provides a server adapter for running Mastra with [Koa](https://koajs.com). For general adapter concepts (constructor options, initialization flow, etc.), see [Server Adapters](https://mastra.ai/docs/server/server-adapters).

## Installation

Install the Koa adapter and Koa framework:

**npm**:

```bash
npm install @mastra/koa@latest koa koa-bodyparser
```

**pnpm**:

```bash
pnpm add @mastra/koa@latest koa koa-bodyparser
```

**Yarn**:

```bash
yarn add @mastra/koa@latest koa koa-bodyparser
```

**Bun**:

```bash
bun add @mastra/koa@latest koa koa-bodyparser
```

## Usage example

```typescript
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { MastraServer } from '@mastra/koa'
import { mastra } from './mastra'

const app = new Koa()
app.use(bodyParser())

const server = new MastraServer({ app, mastra })

await server.init()

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

## Constructor parameters

**app** (`Koa`): Koa app instance

**mastra** (`Mastra`): Mastra instance

**prefix** (`string`): Route path prefix (e.g., /api/v2) (Default: `''`)

**openapiPath** (`string`): Path to serve OpenAPI spec (e.g., /openapi.json) (Default: `''`)

**bodyLimitOptions** (`BodyLimitOptions`): Request body size limits

**streamOptions** (`StreamOptions`): Stream redaction config. When true (default), redacts sensitive data (system prompts, tool definitions, API keys) from stream chunks before sending to clients. (Default: `{ redact: true }`)

**customRouteAuthConfig** (`Map<string, boolean>`): Per-route auth overrides. Keys are METHOD:PATH (e.g., GET:/api/health). Value false makes route public, true requires auth.

**tools** (`ToolsInput`): Available tools for the server

**taskStore** (`InMemoryTaskStore`): Task store for A2A (Agent-to-Agent) operations

**mcpOptions** (`MCPOptions`): MCP transport options. Set serverless: true for stateless environments like Cloudflare Workers or Vercel Edge.

## Error handling

The Koa adapter propagates errors from route handlers up through Koa's middleware chain, following Koa's standard error handling pattern. This means you can use regular Koa error-handling middleware:

```typescript
const app = new Koa()
app.use(bodyParser())

// Your error middleware catches errors from Mastra route handlers
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = { error: err.message }
    // Log, report to Sentry, etc.
  }
})

const server = new MastraServer({ app, mastra })
await server.init()
```

The [`server.onError`](https://mastra.ai/reference/configuration) hook is also supported. When configured, it's called before the error propagates to middleware, and its response is used directly:

```typescript
const mastra = new Mastra({
  server: {
    onError: (err, c) => {
      console.error('Unhandled error:', err)
      return c.json({ error: err.message }, 500)
    },
  },
})
```

When `init()` is used, a global error-handling middleware is also registered as a safety net. Errors that reach this middleware are emitted via `ctx.app.emit('error', err, ctx)` following the standard Koa convention.

## Protecting raw routes

When you want Mastra-managed auth and route metadata such as `requiresAuth`, prefer [`registerApiRoute()`](https://mastra.ai/reference/server/register-api-route). For raw Koa routes mounted directly on the app, use `createAuthMiddleware()`:

```typescript
import Koa from 'koa'
import { createAuthMiddleware, MastraServer } from '@mastra/koa'
import { mastra } from './mastra'

const app = new Koa()
const server = new MastraServer({ app, mastra })

await server.init()

app.use(createAuthMiddleware({ mastra }))
app.use(async ctx => {
  if (ctx.path !== '/custom/protected') return

  const user = ctx.state.requestContext.get('user')
  ctx.body = { user }
})
```

## Manual initialization

For custom middleware ordering, call each method separately instead of `init()`. See [manual initialization](https://mastra.ai/docs/server/server-adapters) for details.

## Examples

- [Koa Adapter](https://github.com/mastra-ai/mastra/tree/main/examples/server-koa-adapter): Basic Koa server setup

## Related

- [Server Adapters](https://mastra.ai/docs/server/server-adapters): Shared adapter concepts
- [MastraServer Reference](https://mastra.ai/reference/server/mastra-server): Full API reference
- [createRoute() Reference](https://mastra.ai/reference/server/create-route): Creating type-safe custom routes