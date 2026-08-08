> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Hono adapter

The `@mastra/hono` package provides a server adapter for running Mastra with [Hono](https://hono.dev). For general adapter concepts (constructor options, initialization flow, etc.), see [Server Adapters](https://mastra.ai/docs/server/server-adapters).

## Installation

Install the Hono adapter and Hono framework:

**npm**:

```bash
npm install @mastra/hono@latest hono
```

**pnpm**:

```bash
pnpm add @mastra/hono@latest hono
```

**Yarn**:

```bash
yarn add @mastra/hono@latest hono
```

**Bun**:

```bash
bun add @mastra/hono@latest hono
```

## Usage example

```typescript
import { Hono } from 'hono'
import { HonoBindings, HonoVariables, MastraServer } from '@mastra/hono'
import { mastra } from './mastra'

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>()
const server = new MastraServer({ app, mastra })

await server.init()

export default app
```

## Constructor parameters

**app** (`Hono`): Hono app instance

**mastra** (`Mastra`): Mastra instance

**prefix** (`string`): Route path prefix (e.g., /api/v2) (Default: `''`)

**openapiPath** (`string`): Path to serve OpenAPI spec (e.g., /openapi.json) (Default: `''`)

**bodyLimitOptions** (`{ maxSize: number, onError: (err) => unknown }`): Request body size limits

**streamOptions** (`{ redact?: boolean }`): Stream redaction config. When true, redacts sensitive data from streams. (Default: `{ redact: true }`)

**customRouteAuthConfig** (`Map<string, boolean>`): Per-route auth overrides. Keys are METHOD:PATH (e.g., GET:/api/health). Value false makes route public, true requires auth.

**tools** (`Record<string, Tool>`): Available tools for the server

**taskStore** (`InMemoryTaskStore`): Task store for A2A (Agent-to-Agent) operations

**mcpOptions** (`MCPOptions`): MCP transport options. Set serverless: true for stateless environments like Cloudflare Workers or Vercel Edge.

## Adding custom routes

Add routes directly to the Hono app:

```typescript
import { Hono } from 'hono'
import { HonoBindings, HonoVariables, MastraServer } from '@mastra/hono'

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>()
const server = new MastraServer({ app, mastra })

// Before init - runs before Mastra middleware
app.get('/early-health', c => c.json({ status: 'ok' }))

await server.init()

// After init - has access to Mastra context
app.get('/custom', c => {
  const mastraInstance = c.get('mastra')
  return c.json({ agents: Object.keys(mastraInstance.listAgents()) })
})
```

> **Tip:** Routes added before `init()` run without Mastra context. Add routes after `init()` to access the Mastra instance and request context.

When you want Mastra-managed auth and route metadata such as `requiresAuth`, prefer [`registerApiRoute()`](https://mastra.ai/reference/server/register-api-route). For raw Hono routes mounted directly on `app`, use `createAuthMiddleware()`:

```typescript
import { Hono } from 'hono'
import { createAuthMiddleware, HonoBindings, HonoVariables, MastraServer } from '@mastra/hono'
import { mastra } from './mastra'

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>()
const server = new MastraServer({ app, mastra })

await server.init()

app.get('/custom/protected', createAuthMiddleware({ mastra }), c => {
  const user = c.get('requestContext').get('user')
  return c.json({ user })
})

app.get('/custom/public', createAuthMiddleware({ mastra, requiresAuth: false }), c => {
  return c.json({ ok: true })
})
```

## Accessing context

In Hono middleware and route handlers, access Mastra context via `c.get()`:

```typescript
app.get('/custom', async c => {
  const mastra = c.get('mastra')
  const requestContext = c.get('requestContext')
  const abortSignal = c.get('abortSignal')

  const agent = mastra.getAgent('myAgent')
  return c.json({ agent: agent.name })
})
```

Available context keys:

| Key                     | Description                             |
| ----------------------- | --------------------------------------- |
| `mastra`                | Mastra instance                         |
| `requestContext`        | Request context map                     |
| `abortSignal`           | Request cancellation signal             |
| `tools`                 | Available tools                         |
| `taskStore`             | Task store for A2A operations           |
| `customRouteAuthConfig` | Per-route auth overrides                |
| `user`                  | Authenticated user (if auth configured) |

## Adding middleware

Add Hono middleware before or after `init()`:

```typescript
import { Hono } from 'hono'
import { HonoBindings, HonoVariables, MastraServer } from '@mastra/hono'

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>()

// Middleware before init
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`)
  await next()
})

const server = new MastraServer({ app, mastra })
await server.init()

// Middleware after init has access to Mastra context
app.use('*', async (c, next) => {
  const mastra = c.get('mastra')
  await next()
})
```

## Manual initialization

For custom middleware ordering, call each method separately instead of `init()`. See [manual initialization](https://mastra.ai/docs/server/server-adapters) for details.

## Examples

- [Hono Adapter](https://github.com/mastra-ai/mastra/tree/main/examples/server-hono-adapter): Basic Hono server setup

## Related

- [Server Adapters](https://mastra.ai/docs/server/server-adapters): Shared adapter concepts
- [MastraServer Reference](https://mastra.ai/reference/server/mastra-server): Full API reference
- [createRoute() Reference](https://mastra.ai/reference/server/create-route): Creating type-safe custom routes