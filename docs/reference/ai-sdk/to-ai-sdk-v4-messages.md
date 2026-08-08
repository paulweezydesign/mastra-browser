> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# toAISdkV4Messages()

Converts messages from input formats to AI SDK V4 UI message format. This function accepts messages in multiple formats (strings, AI SDK V4/V5 messages, Mastra DB messages, etc.) and normalizes them to the AI SDK V4 `UIMessage` format, which is suitable for use with AI SDK UI components like `useChat()`.

## Usage example

```typescript
import { toAISdkV4Messages } from '@mastra/ai-sdk'
import { useChat } from 'ai/react' // AI SDK V4

// Stored messages from your database, memory or API
const storedMessages = [
  { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
  { id: '2', role: 'assistant', parts: [{ type: 'text', text: 'Hi there!' }] },
]

export default function Chat() {
  const { messages } = useChat({
    initialMessages: toAISdkV4Messages(storedMessages),
  })

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role}: {message.content}
        </div>
      ))}
    </div>
  )
}
```

## Parameters

**messages** (`MessageListInput`): Messages to convert. Can be a string, array of strings, a single message object, or an array of message objects in any supported format.

## Returns

Returns an array of AI SDK V4 `UIMessage` objects with the following structure:

**id** (`string`): Unique message identifier.

**role** (`'user' | 'assistant' | 'system'`): The role of the message sender.

**content** (`string`): Text content of the message.

**parts** (`UIMessagePart[]`): Array of UI parts including text, tool-invocation, file, reasoning, source, and step markers.

**createdAt** (`Date`): Message creation timestamp.

**toolInvocations** (`ToolInvocation[]`): Array of tool invocations for assistant messages.

**experimental\_attachments** (`Attachment[]`): File attachments on the message.

**metadata** (`Record<string, unknown>`): Custom metadata attached to the message.

## Examples

### Converting text messages

```typescript
import { toAISdkV4Messages } from '@mastra/ai-sdk'

const messages = toAISdkV4Messages(['Hello', 'How can I help you today?'])
// Returns array of UIMessage objects with user role and content string
```

### Loading messages with Mastra client

```typescript
import { MastraClient } from '@mastra/client-js'
import { toAISdkV4Messages } from '@mastra/ai-sdk'

const client = new MastraClient()

const { messages } = await client.listThreadMessages('thread-id', { agentId: 'myAgent' })
const uiMessages = toAISdkV4Messages(messages)
```