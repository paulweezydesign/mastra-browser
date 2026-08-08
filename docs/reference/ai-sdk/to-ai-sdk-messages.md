> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# toAISdkMessages()

Converts messages from input formats to AI SDK UI message format. `toAISdkMessages()` keeps the existing AI SDK v5/default behavior. If your app is typed against AI SDK v6, pass `version: 'v6'`.

`version: 'v6'` uses the MessageList AI SDK v6 UI output path. MessageList input detection and ingestion remain unchanged.

## Usage example

```typescript
import { toAISdkMessages } from '@mastra/ai-sdk/ui'
import { useChat } from 'ai/react'

// Stored messages from your database, memory, or API
const storedMessages = [
  { id: '1', role: 'user', content: 'Hello', parts: [{ type: 'text', text: 'Hello' }] },
  {
    id: '2',
    role: 'assistant',
    content: 'Hi there!',
    parts: [{ type: 'text', text: 'Hi there!' }],
  },
]

export default function Chat() {
  const { messages } = useChat({
    initialMessages: toAISdkMessages(storedMessages, { version: 'v6' }),
  })

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role}: {message.parts.map(part => (part.type === 'text' ? part.text : null))}
        </div>
      ))}
    </div>
  )
}
```

## Parameters

**messages** (`MessageListInput`): Messages to convert. Can be a string, array of strings, a single message object, or an array of message objects in any supported format.

**options.version** (`'v5' | 'v6'`): Selects the AI SDK message type to return. Omit it or pass 'v5' for the existing default behavior. Pass 'v6' when your app is typed against AI SDK v6 useChat() message types.

## Returns

Returns an array of AI SDK `UIMessage` objects typed for the selected version.

**id** (`string`): Unique message identifier.

**role** (`'user' | 'assistant' | 'system'`): The role of the message sender.

**parts** (`UIMessagePart[]`): Array of UI parts including text, tool results, files, reasoning, sources, and step markers.

**metadata** (`Record<string, unknown>`): Optional metadata including createdAt, threadId, resourceId, and custom fields.

## Examples

### Using the default AI SDK v5 types

```typescript
import { toAISdkMessages } from '@mastra/ai-sdk/ui'

const messages = toAISdkMessages(['Hello', 'How can I help you today?'])
```

### Returning AI SDK v6 message types

```typescript
import { toAISdkMessages } from '@mastra/ai-sdk/ui'

const messages = toAISdkMessages(['Hello', 'How can I help you today?'], {
  version: 'v6',
})
```

### Loading messages with Mastra client

```typescript
import { MastraClient } from '@mastra/client-js'
import { toAISdkMessages } from '@mastra/ai-sdk/ui'

const client = new MastraClient()

const { messages } = await client.listThreadMessages('thread-id', { agentId: 'myAgent' })
const uiMessages = toAISdkMessages(messages)
```

## Related

- [`toAISdkStream()`](https://mastra.ai/reference/ai-sdk/to-ai-sdk-stream)
- [`toAISdkV5Messages()`](https://mastra.ai/reference/ai-sdk/to-ai-sdk-v5-messages)
- [`toAISdkV4Messages()`](https://mastra.ai/reference/ai-sdk/to-ai-sdk-v4-messages)