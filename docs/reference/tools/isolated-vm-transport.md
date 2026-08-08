> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# IsolatedVmCodeModeTransport

> **Beta:** This feature is in beta. Breaking changes may occur without a major version bump until the API is stable.

The `IsolatedVmCodeModeTransport` class runs [Code mode](https://mastra.ai/docs/agents/code-mode) programs in an in-process V8 isolate, backed by [isolated-vm](https://github.com/laverdet/isolated-vm). The isolate is the execution boundary, so no workspace sandbox is required: the program has no filesystem, network, process, or module access. Its only capabilities are the `external_*` functions, which call back into the real tools on the host.

Compared to the default `StdioCodeModeTransport`, this transport spawns no processes and writes no temp files, which makes it a good fit for serverless and multi-tenant hosts where OS-level sandboxing isn't available.

## Installation

**npm**:

```bash
npm install @mastra/isolated-vm
```

**pnpm**:

```bash
pnpm add @mastra/isolated-vm
```

**Yarn**:

```bash
yarn add @mastra/isolated-vm
```

**Bun**:

```bash
bun add @mastra/isolated-vm
```

`isolated-vm` is a native addon. It provides prebuilt binaries for common platforms, so installation usually needs no extra setup. A C++ toolchain is only needed on platforms without a matching prebuild, where it falls back to compiling from source.

On Node.js 20 and later, the host process must be started with the `--no-node-snapshot` flag, otherwise creating an isolate crashes the process. The constructor throws an error when the flag is missing. Pass the flag when starting your server, or set it through `NODE_OPTIONS`:

```bash
NODE_OPTIONS=--no-node-snapshot npm run dev
```

## Usage

Pass the transport as the second argument to `createCodeMode()`. No `sandbox` is needed:

```typescript
import { createCodeMode } from '@mastra/core/tools'
import { IsolatedVmCodeModeTransport } from '@mastra/isolated-vm'

const { tool, instructions } = createCodeMode(
  { tools: { getTopProducts, getProductRatings } },
  new IsolatedVmCodeModeTransport({ memoryLimitMb: 128 }),
)
```

## Constructor parameters

**options** (`IsolatedVmCodeModeTransportOptions`): Configuration for the isolate.

**options.memoryLimitMb** (`number`): V8 isolate heap limit in MiB. A program that exceeds the limit is terminated and the tool returns an error result.

## How it works

Each run creates a fresh isolate with its own heap. TypeScript is stripped on the host with esbuild, then the program is evaluated inside the isolate. Every `external_*` call crosses the isolate boundary as JSON strings in both directions, so no host object references leak into model-authored code. The allow-list, tool validation, request context, and tracing all run on the host, the same as with other transports.

The `timeout` configured on `createCodeMode()` applies to both asynchronous hangs and synchronous infinite loops, and the isolate is disposed after every run.

## Related

- [Code mode](https://mastra.ai/docs/agents/code-mode)
- [createCodeMode() reference](https://mastra.ai/reference/tools/create-code-mode)