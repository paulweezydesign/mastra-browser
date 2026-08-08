> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Laminar exporter

[Laminar](https://laminar.sh/) is an open-source, OpenTelemetry-native observability platform for AI agents. Trace, debug, and monitor every Mastra agent run, model step, tool call, and sub-agent with a single `MastraExporter` wired into your `Observability` config.

## Installation

**npm**:

```bash
npm install @lmnr-ai/lmnr
```

**pnpm**:

```bash
pnpm add @lmnr-ai/lmnr
```

**Yarn**:

```bash
yarn add @lmnr-ai/lmnr
```

**Bun**:

```bash
bun add @lmnr-ai/lmnr
```

## Configuration

### Prerequisites

1. **Laminar Project**: Create/select a project in Laminar
2. **Project API Key**: Copy from Laminar Project Settings
3. **Environment Variables**: Set your credentials

```bash
# Required
LMNR_PROJECT_API_KEY=lmnr_...

# Optional
LMNR_BASE_URL=https://api.lmnr.ai
```

### Zero-Config Setup

With environment variables set, use the exporter with no configuration:

```typescript
import { Mastra } from '@mastra/core'
import { Observability } from '@mastra/observability'
import { Laminar, MastraExporter } from '@lmnr-ai/lmnr'

Laminar.initialize()

export const mastra = new Mastra({
  observability: new Observability({
    configs: {
      laminar: {
        serviceName: 'my-service',
        exporters: [new MastraExporter()],
      },
    },
  }),
})
```

### Explicit Configuration

You can also pass credentials directly (takes precedence over environment variables):

```typescript
import { Mastra } from '@mastra/core'
import { Observability } from '@mastra/observability'
import { Laminar, MastraExporter } from '@lmnr-ai/lmnr'

Laminar.initialize({
  projectApiKey: process.env.LMNR_PROJECT_API_KEY!,
  baseUrl: process.env.LMNR_BASE_URL, // Optional
  // ...other options
})

export const mastra = new Mastra({
  observability: new Observability({
    configs: {
      laminar: {
        serviceName: 'my-service',
        exporters: [
          new MastraExporter({
            realtime: process.env.NODE_ENV === 'development', // Optional
          }),
        ],
      },
    },
  }),
})
```

> **Note:** For advanced usage, including the full `MastraExporter` options and multi-agent trace examples, see [Laminar's Mastra integration guide](https://laminar.sh/docs/tracing/integrations/mastra).

Mastra also includes a standalone [`LaminarExporter`](https://mastra.ai/reference/observability/tracing/exporters/laminar) in `@mastra/laminar` that sends spans over OTLP/HTTP. It can't inherit an active OTel context and doesn't fully map Mastra spans to Laminar's native format, so use the `@lmnr-ai/lmnr` integration above for `observe()` wrappers, multi-agent root spans, and accurate Laminar rendering.

## Related

- [Tracing Overview](https://mastra.ai/docs/observability/tracing/overview)
- [Laminar Documentation](https://laminar.sh/docs)