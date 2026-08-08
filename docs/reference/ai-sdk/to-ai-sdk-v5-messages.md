> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# toAISdkV5Messages()

Converts messages from input formats to AI SDK V5 (and later) UI message format. This function accepts messages in multiple formats (strings, AI SDK V4/V5 messages, Mastra DB messages, etc.) and normalizes them to the AI SDK V5+ `UIMessage` format, which is suitable for use with AI SDK UI components like `useChat()`.

## Usage example

```typescript
import { toAISdkV5Messages } from '@mastra/ai-sdk/ui'
import { useChat } from 'ai/react'

// Stored messages from your database, memory or API
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
    initialMessages: toAISdkV5Messages(storedMessages),
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

## Returns

Returns an array of AI SDK V5+ `UIMessage` objects with the following structure:

**id** (`string`): Unique message identifier.

**role** (`'user' | 'assistant' | 'system'`): The role of the message sender.

**parts** (`UIMessagePart[]`): Array of UI parts including text, tool results, files, reasoning, sources, and step markers.

**metadata** (`Record<string, unknown>`): Optional metadata including createdAt, threadId, resourceId, and custom fields.

## Examples

### Converting text messages

```typescript
import { toAISdkV5Messages } from '@mastra/ai-sdk/ui'

const messages = toAISdkV5Messages(['Hello', 'How can I help you today?'])
// Returns array of UIMessage objects with user role
```

### Loading messages with Mastra client

```typescript
import { MastraClient } from '@mastra/client-js'
import { toAISdkV5Messages } from '@mastra/ai-sdk/ui'

const client = new MastraClient()

const { messages } = await client.listThreadMessages('thread-id', { agentId: 'myAgent' })
const uiMessages = toAISdkV5Messages(messages)
```