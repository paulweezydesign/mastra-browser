> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# ToolProvider

The `ToolProvider` interface defines how the editor discovers and resolves integration tools from external platforms. Mastra includes two built-in implementations: `ComposioToolProvider` and `ArcadeToolProvider`.

See [Editor tools](https://mastra.ai/docs/editor/overview) for provider setup and the Studio workflow. See [tool configuration](https://mastra.ai/reference/editor/tools) for stored selections and resolution behavior.

## ToolProvider interface

Providers expose metadata and the legacy discovery and resolution methods. Agent Builder integrations can also implement the optional VNext catalog, connection, authorization, and health methods.

**info** (`ToolProviderInfo`): Provider ID, name, and description.

**displayName** (`string`): Optional name shown in the tool picker. Defaults to info.name.

**capabilities** (`ToolProviderCapabilities`): Static connection and revocation capabilities. Required for VNext providers.

**defaultScope** (`'per-author' | 'caller-supplied'`): Default connection identity scope. Defaults to 'per-author' when omitted.

**listToolkits()** (`() => Promise<ToolProviderListResult<ToolProviderToolkit>>`): Lists available toolkits through the legacy interface.

**listTools(params?)** (`(params?: ListToolProviderToolsOptions) => Promise<ToolProviderListResult<ToolProviderToolInfo>>`): Lists tools with optional toolkit, search, and pagination filters.

**getToolSchema(slug)** (`(slug: string) => Promise<Record<string, unknown> | null>`): Returns a tool input schema through the legacy interface.

**resolveTools(slugs, configs?, options?)** (`(slugs: string[], configs?: Record<string, StorageToolConfig>, options?: ResolveToolProviderToolsOptions) => Promise<Record<string, ToolAction>>`): Resolves legacy tool selections into executable Mastra tools.

**listToolkitsVNext()** (`() => Promise<ListToolkitsResult>`): Lists allowed toolkits for Agent Builder and Editor.

**listToolsVNext(options?)** (`(options?: ListToolsOpts) => Promise<ListToolsResult>`): Lists allowed tools with toolkit, search, and pagination options.

**resolveToolsVNext(options)** (`(options: ResolveToolsOpts) => Promise<Record<string, ToolAction>>`): Resolves tools for one set of slugs and one authorized connection.

**authorize(options)** (`(options: AuthorizeOpts) => Promise<{ url: string; authId: string }>`): Starts an authorization flow.

**listConnectionFields(options)** (`(options: { toolkit: string }) => Promise<ConnectionField[]>`): Lists provider-specific values required to authorize a toolkit.

**getAuthStatus(authId)** (`(authId: string) => Promise<AuthFlowStatus>`): Returns the state of an authorization flow.

**getConnectionStatus(options)** (`(options: { items: Array<{ connectionId: string; toolkit: string }> }) => Promise<Record<string, { connected: boolean }>>`): Checks whether a batch of connections is still active.

**listConnections(options)** (`(options: ListConnectionsOpts) => Promise<ListConnectionsResult>`): Lists existing provider connections for a user and toolkit.

**getHealth()** (`() => Promise<ToolProviderHealth>`): Returns provider configuration and reachability health.

**revokeConnection(connectionId)** (`(connectionId: string) => Promise<void>`): Revokes a provider connection.

***

## ComposioToolProvider

Connects to [Composio](https://composio.dev) for access to hundreds of integration tools.

### Usage example

```typescript
import { MastraEditor } from '@mastra/editor'
import { ComposioToolProvider } from '@mastra/editor/composio'

const editor = new MastraEditor({
  toolProviders: {
    composio: new ComposioToolProvider({
      apiKey: process.env.COMPOSIO_API_KEY!,
    }),
  },
})
```

### Constructor parameters

**apiKey** (`string`): Your Composio API key.

**allowedToolkits** (`readonly string[]`): Toolkit slug allowlist. Supports exact matches and suffix wildcards.

**allowedTools** (`Readonly<Record<string, readonly string[]>>`): Per-toolkit tool slug allowlists. Supports exact matches and prefix wildcards.

**defaultScope** (`'per-author' | 'caller-supplied'`): Connection identity scope. Defaults to per-author. (Default: `'per-author'`)

### Tool slugs

Composio tools use uppercase slug format: `GITHUB_CREATE_ISSUE`, `SLACK_SEND_MESSAGE`.

### Authentication

Connections use per-author scope by default. Set `defaultScope: 'caller-supplied'` to bucket authorization by the caller identity resolved from `MASTRA_RESOURCE_ID_KEY` in request context. Ensure each authenticated request provides a stable, unique resource ID. When using `MastraAuthWorkos`, configure `mapUserToResourceId` to set this value from the authenticated user.

### Connection management tools

Composio provides tools for starting and monitoring authorization from an agent chat. When `allowedToolkits` is set, include `composio` to make these tools available:

```typescript
const editor = new MastraEditor({
  toolProviders: {
    composio: new ComposioToolProvider({
      apiKey: process.env.COMPOSIO_API_KEY!,
      allowedToolkits: ['composio', 'gmail'],
      defaultScope: 'caller-supplied',
    }),
  },
})
```

Add only the connection management tools that the agent needs:

| Tool                            | Behavior                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `COMPOSIO_MANAGE_CONNECTIONS`   | Creates an authorization link in chat through a session owned by the caller. |
| `COMPOSIO_WAIT_FOR_CONNECTIONS` | Waits for the caller to finish authorization before the agent continues.     |

`COMPOSIO_WAIT_FOR_CONNECTIONS` is optional. Without it, complete authorization and return to the chat. Then ask the agent to continue. The connected account remains associated with the caller resource ID for later requests.

***

## ArcadeToolProvider

Connects to [Arcade](https://arcade.dev) for a curated tool catalog with built-in authentication.

### Usage example

```typescript
import { MastraEditor } from '@mastra/editor'
import { ArcadeToolProvider } from '@mastra/editor/arcade'

const editor = new MastraEditor({
  toolProviders: {
    arcade: new ArcadeToolProvider({
      apiKey: process.env.ARCADE_API_KEY!,
    }),
  },
})
```

### Constructor parameters

**apiKey** (`string`): Your Arcade API key.

**baseURL** (`string`): Custom base URL for the Arcade API.

### Tool slugs

Arcade tools use `Toolkit.ToolName` format: `Github.GetRepository`, `Slack.SendMessage`.

### Authentication

The legacy Arcade resolver uses `resourceId` from request context when available. It otherwise falls back to the supplied `userId`, then to a shared `default` identity. Use `default` only for intentionally shared integrations. In tenant-isolated deployments, provide a trusted, stable `resourceId` or explicit `userId`. Omitting both doesn't isolate callers.