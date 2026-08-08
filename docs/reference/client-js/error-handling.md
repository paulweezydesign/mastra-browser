> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# Error handling

The Mastra Client SDK includes built-in retry mechanism and error handling capabilities.

## Error handling

All API methods can throw errors that you can catch and handle:

```typescript
try {
  const agent = mastraClient.getAgent('agent-id')
  const response = await agent.generate('Hello')
} catch (error) {
  console.error('An error occurred:', error.message)
}
```