> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Express adapter

The `@mastra/express` package provides a server adapter for running Mastra with [Express](https://expressjs.com). For general adapter concepts (constructor options, initialization flow, etc.), see [Server Adapters](https://mastra.ai/docs/server/server-adapters).

## Installation

Install the Express adapter and Express framework:

**npm**:

```bash
npm install @mastra/express@latest express
```

**pnpm**:

```bash
pnpm add @mastra/express@latest express
```

**Yarn**:

```bash
yarn add @mastra/express@latest express
```

**Bun**:

```bash
bun add @mastra/express@latest express
```

## Usage example

```typescript
import express from 'express'
import { MastraServer } from '@mastra/express'
import { mastra } from './mastra'

const app = express()
app.use(express.json()) // Required for body parsing

const server = new MastraServer({ app, mastra })
await server.init()

app.listen(4111, () => {
  console.log('Server running on port 4111')
})
```

> **Note:** Express requires `express.json()` middleware for JSON body parsing. Add it before creating the `MastraServer`.

## Constructor parameters

**app** (`Application`): Express app instance

**mastra** (`Mastra`): Mastra instance

**prefix** (`string`): Route path prefix (e.g., /api/v2) (Default: `''`)

**openapiPath** (`string`): Path to serve OpenAPI spec (e.g., /openapi.json) (Default: `''`)

**bodyLimitOptions** (`{ maxSize: number, onError: (err) => unknown }`): Request body size limits

**streamOptions** (`{ redact?: boolean }`): Stream redaction config. When true, redacts sensitive data from streams. (Default: `{ redact: true }`)

**customRouteAuthConfig** (`Map<string, boolean>`): Per-route auth overrides. Keys are METHOD:PATH (e.g., GET:/api/health). Value false makes route public, true requires auth.

**tools** (`Record<string, Tool>`): Available tools for the server

**taskStore** (`InMemoryTaskStore`): Task store for A2A (Agent-to-Agent) operations

**mcpOptions** (`MCPOptions`): MCP transport options. Set serverless: true for stateless environments like Cloudflare Workers or Vercel Edge.

## Differences from Hono

| Aspect               | Express                        | Hono                  |
| -------------------- | ------------------------------ | --------------------- |
| Body parsing         | Requires `express.json()`      | Handled by framework  |
| Context storage      | `res.locals`                   | `c.get()` / `c.set()` |
| Middleware signature | `(req, res, next)`             | `(c, next)`           |
| Streaming            | `res.write()` / `res.end()`    | `stream()` helper     |
| AbortSignal          | Created from `req.on('close')` | `c.req.raw.signal`    |

## Adding custom routes

Add routes directly to the Express app:

```typescript
const app = express()
app.use(express.json())

const server = new MastraServer({ app, mastra })

// Before init - runs before Mastra middleware
app.get('/early-health', (req, res) => res.json({ status: 'ok' }))

await server.init()

// After init - has access to Mastra context
app.get('/custom', (req, res) => {
  const mastraInstance = res.locals.mastra
  res.json({ agents: Object.keys(mastraInstance.listAgents()) })
})

app.listen(4111)
```

> **Tip:** Routes added before `init()` run without Mastra context. Add routes after `init()` to access the Mastra instance and request context.

When you want Mastra-managed auth and route metadata such as `requiresAuth`, prefer [`registerApiRoute()`](https://mastra.ai/reference/server/register-api-route). For raw Express routes mounted directly on `app`, use `createAuthMiddleware()`:

```typescript
import express from 'express'
import { createAuthMiddleware, MastraServer } from '@mastra/express'
import { mastra } from './mastra'

const app = express()
app.use(express.json())

const server = new MastraServer({ app, mastra })
await server.init()

app.get('/custom/protected', createAuthMiddleware({ mastra }), (req, res) => {
  const user = res.locals.requestContext.get('user')
  res.json({ user })
})

app.get('/custom/public', createAuthMiddleware({ mastra, requiresAuth: false }), (req, res) => {
  res.json({ ok: true })
})
```

## Accessing context

In Express middleware and routes, access Mastra context via `res.locals`:

```typescript
app.get('/custom', (req, res) => {
  const mastra = res.locals.mastra
  const requestContext = res.locals.requestContext
  const abortSignal = res.locals.abortSignal

  const agent = mastra.getAgent('myAgent')
  res.json({ agent: agent.name })
})
```

Available properties on `res.locals`:

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

Add Express middleware before or after `init()`:

```typescript
const app = express()
app.use(express.json())

// Middleware before init
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

const server = new MastraServer({ app, mastra })
await server.init()

// Middleware after init has access to Mastra context
app.use((req, res, next) => {
  const mastra = res.locals.mastra
  next()
})
```

## Manual initialization

For custom middleware ordering, call each method separately instead of `init()`. See [manual initialization](https://mastra.ai/docs/server/server-adapters) for details.

## Examples

- [Express Adapter](https://github.com/mastra-ai/mastra/tree/main/examples/server-express-adapter): Basic Express server setup

## Related

- [Server Adapters](https://mastra.ai/docs/server/server-adapters): Shared adapter concepts
- [MastraServer Reference](https://mastra.ai/reference/server/mastra-server): Full API reference
- [createRoute() Reference](https://mastra.ai/reference/server/create-route): Creating type-safe custom routes