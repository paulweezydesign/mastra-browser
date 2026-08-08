> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# AgentCoreRuntimeSandbox

Executes shell commands in an [AWS Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-execute-command.html) session by using `InvokeAgentRuntimeCommand`.

Use `AgentCoreRuntimeSandbox` when your agent already runs in AgentCore Runtime and you want Mastra workspace command execution to use the same runtime session. For interface details, see [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox).

> **Warning:** `AgentCoreRuntimeSandbox` only supports one-shot command execution. It doesn't support background process management, stdin, or filesystem mounts. AgentCore Code Interpreter is a separate AWS service and isn't part of this provider.

## Installation

**npm**:

```bash
npm install @mastra/agentcore
```

**pnpm**:

```bash
pnpm add @mastra/agentcore
```

**Yarn**:

```bash
yarn add @mastra/agentcore
```

**Bun**:

```bash
bun add @mastra/agentcore
```

## Usage

Add an `AgentCoreRuntimeSandbox` to a workspace and assign it to an agent:

```typescript
import { Agent } from '@mastra/core/agent'
import { Workspace } from '@mastra/core/workspace'
import { AgentCoreRuntimeSandbox } from '@mastra/agentcore'

const workspace = new Workspace({
  sandbox: new AgentCoreRuntimeSandbox({
    region: 'us-west-2',
    agentRuntimeArn: process.env.AGENTCORE_RUNTIME_ARN!,
    runtimeSessionId: '12345678-1234-1234-1234-123456789012',
  }),
})

const agent = new Agent({
  id: 'dev-agent',
  name: 'dev-agent',
  model: 'anthropic/claude-sonnet-4-6',
  instructions: 'You are a helpful development assistant.',
  workspace,
})
```

Run commands programmatically through the sandbox:

```typescript
const result = await workspace.sandbox?.executeCommand?.('npm', ['test'], {
  cwd: '/workspace',
  env: {
    NODE_ENV: 'test',
  },
  timeout: 300_000,
})

if (!result?.success) {
  console.error(result?.stderr)
}
```

## Constructor parameters

**agentRuntimeArn** (`string`): AgentCore Runtime ARN where commands execute.

**region** (`string`): AWS region for the Bedrock AgentCore client. Falls back to the AWS SDK default region chain.

**runtimeSessionId** (`string`): AgentCore Runtime session ID. Defaults to a generated UUID, which satisfies AgentCore Runtime session ID length requirements. (Default: `Generated UUID`)

**qualifier** (`string`): Agent runtime qualifier or endpoint. (Default: `DEFAULT`)

**contentType** (`string`): MIME type sent for command requests. (Default: `application/json`)

**accept** (`string`): Accept header used for command event streams. (Default: `application/vnd.amazon.eventstream`)

**commandTimeout** (`number`): Default command timeout in milliseconds. (Default: `300000`)

**stopSessionOnLifecycle** (`boolean`): Whether stop() and destroy() should call StopRuntimeSession. Defaults to false because AgentCore Runtime sessions are often shared with agent invocations outside the sandbox instance. (Default: `false`)

**stopClientToken** (`string`): Client token used when StopRuntimeSession is called. (Default: `Generated UUID`)

**client** (`BedrockAgentCoreClient`): Preconfigured AWS SDK client. Use this for custom credentials, retry behavior, or tests.

**instructions** (`string | ((opts) => string)`): Custom instructions that override the default instructions returned by getInstructions(). Pass a string to replace the defaults, or a function to extend them.

## Properties

**id** (`string`): Runtime session ID used by this sandbox instance.

**name** (`'AgentCoreRuntimeSandbox'`): Human-readable name.

**provider** (`'agentcore'`): Provider type identifier.

**status** (`ProviderStatus`): Current lifecycle status: 'pending', 'starting', 'running', 'stopping', 'stopped', 'destroying', 'destroyed', or 'error'.

**runtimeSessionId** (`string`): AgentCore Runtime session ID used for command execution.

**agentRuntimeArn** (`string`): AgentCore Runtime ARN where commands execute.

## Methods

### Command execution

#### `executeCommand(command, args?, options?)`

Runs a one-shot shell command in the AgentCore Runtime session and returns stdout, stderr, exit code, and timeout status.

```typescript
const result = await sandbox.executeCommand('npm', ['test'], {
  cwd: '/workspace',
  env: {
    NODE_ENV: 'test',
  },
  timeout: 300_000,
})
```

Returns: `Promise<CommandResult>`.

`options.timeout` is specified in milliseconds. AgentCore Runtime accepts command timeouts from 1 to 3600 seconds. The provider converts milliseconds to seconds before sending the request.

### Lifecycle

#### `start()`

Runs the sandbox lifecycle start hook. This provider doesn't create an AgentCore Runtime session during `start()`.

```typescript
await sandbox.start()
```

#### `stop()`

Stops the AgentCore Runtime session only when `stopSessionOnLifecycle` is `true`.

```typescript
await sandbox.stop()
```

#### `stopRuntimeSession()`

Explicitly stops the AgentCore Runtime session used by this sandbox.

Use this when the sandbox owns the runtime session and you want to clean it up directly. `destroy()` doesn't call this method unless `stopSessionOnLifecycle` is `true`, because AgentCore Runtime sessions can be shared with agent invocations outside the Workspace sandbox lifecycle.

```typescript
await sandbox.stopRuntimeSession()
```

#### `destroy()`

Destroys the sandbox instance. If this instance owns its AWS SDK client, `destroy()` also destroys the client. If `stopSessionOnLifecycle` is `true`, it calls `StopRuntimeSession`.

```typescript
await sandbox.destroy()
```

### Metadata

#### `getInfo()`

Returns sandbox status and AgentCore Runtime metadata.

```typescript
const info = await sandbox.getInfo()
```

Returns: `Promise<SandboxInfo>`.

## Limitations

`AgentCoreRuntimeSandbox` follows AgentCore Runtime command execution semantics:

- **One-shot commands**: Each command runs to completion or timeout.
- **No persistent shell**: Shell state doesn't carry over between commands. Encode state in each command, for example `cd /workspace && npm test`.
- **Background processes aren't supported**: The provider doesn't expose a `processes` manager.
- **Interactive stdin is unavailable**: Runtime command execution doesn't provide an interactive stdin stream through this provider.
- **Workspace filesystem mounts are unsupported**: Workspace filesystem mounting isn't supported by this provider.
- **Container-dependent tools**: Commands can only use tools installed in the AgentCore Runtime container image.

## Related

- [WorkspaceSandbox interface](https://mastra.ai/reference/workspace/sandbox)
- [Workspace class](https://mastra.ai/reference/workspace/workspace-class)
- [Sandbox overview](https://mastra.ai/docs/workspace/sandbox)
- [AWS Bedrock AgentCore Runtime command execution](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-execute-command.html)