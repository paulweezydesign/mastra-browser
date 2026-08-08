> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Logs API

The Logs API provides methods to access and query system logs and debugging information in Mastra.

## Getting logs

Retrieve system logs with optional filtering:

```typescript
const logs = await mastraClient.listLogs({
  transportId: 'transport-1',
})
```

## Getting logs for a specific run

Retrieve logs for a specific execution run:

```typescript
const runLogs = await mastraClient.getLogForRun({
  runId: 'run-1',
  transportId: 'transport-1',
})
```