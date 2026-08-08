> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# mountAgentControllerOnMastra()

> **Beta:** The `@mastra/code-sdk` package is experimental and subject to breaking changes in minor versions.

The `mountAgentControllerOnMastra()` function builds the Mastra Code agent controller (the coding agent behind the [`mastracode`](https://www.npmjs.com/package/mastracode) CLI, with its modes, tools, memory, and thread management) and registers it on a server-owned [Mastra](https://mastra.ai/reference/core/mastra-class) instance. Use it to serve the Mastra Code agent to your own UI (web app, editor, bot): each client creates or resumes its own isolated session through the returned [`AgentController`](https://mastra.ai/reference/agent-controller/agent-controller-class).

To construct the `Mastra` instance yourself (for example in a deployable entry file), use `prepareAgentControllerMount()` from the same package, which returns the constructor args plus a `finalize()` callback.

## Usage example

```typescript
import { mountAgentControllerOnMastra } from '@mastra/code-sdk'

const { mastra, controller } = await mountAgentControllerOnMastra({
  cwd: process.cwd(),
})

// Each client drives its own session
const session = await controller.createSession({ resourceId: 'user-123' })
```

Pass an existing `mastra` to mount the controller onto a Mastra instance that already hosts other primitives:

```typescript
import { Mastra } from '@mastra/core/mastra'
import { mountAgentControllerOnMastra } from '@mastra/code-sdk'

const mastra = new Mastra({/* ... */})

const { controller } = await mountAgentControllerOnMastra({ mastra })
```

## Parameters

**cwd** (`string`): Working directory for project detection. (Default: `process.cwd()`)

**mastra** (`Mastra`): Existing Mastra instance to mount onto. When omitted, a Mastra is created that owns the controller storage.

**controllerId** (`string`): Id under which the controller is registered on the Mastra instance.

**modes** (`AgentControllerMode[]`): Override agent modes (model ids, colors, which modes exist). (Default: `build/plan/fast`)

**subagents** (`AgentControllerSubagent[]`): Override or extend subagent definitions. (Default: `explore/plan/execute`)

**extraTools** (`Record<string, ToolAction> | (ctx) => Record<string, ToolAction>`): Extra tools merged into the dynamic tool set.

**postToolObserver** (`(context: ToolAfterHookContext) => void | Promise<void>`): Observes completed tool calls without replacing the tool or changing hook-manager behavior. Observer errors are logged and do not fail successful tool calls.

**inputProcessors** (`InputProcessor[]`): Stateless input processors prepended before Mastra Code's mandatory safety and compatibility processors. Custom processors extend the pipeline but can't replace the built-in processors.

**disabledTools** (`string[]`): Tools removed from the dynamic tool set before exposure to the model.

**storage** (`StorageConfig`): Custom storage config instead of the auto-detected default.

**workspace** (`AgentControllerConfig["workspace"]`): Override the workspace. (Default: `local filesystem + local sandbox based on the detected project`)

**configDir** (`string`): Override the config directory name used for all project-level and global config paths (MCP, hooks, commands, database, skills, agent instructions). (Default: `'.mastracode'`)

**mcpServers** (`Record<string, McpServerConfig>`): Programmatic MCP server configurations, merged with (and overriding) file-based configs.

**buildApiRoutes** (`(deps: { controller, authStorage }) => ApiRoute[]`): Additional API routes registered on the constructed Mastra. Ignored when mastra is provided.

**buildServerConfig** (`(deps: { controller, authStorage }) => ServerConfig`): Additional server config (middleware, CORS) folded onto the constructed Mastra. Ignored when mastra is provided.

## Returns

**mastra** (`Mastra`): The Mastra instance the controller is mounted on (created or passed in).

**controller** (`AgentController`): The initialized Mastra Code agent controller. Create sessions with controller.createSession().

**authStorage** (`AuthStorage`): Credential storage used by the built-in model gateway.

## Related

- [AgentController class](https://mastra.ai/reference/agent-controller/agent-controller-class)
- [Session class](https://mastra.ai/reference/agent-controller/session)