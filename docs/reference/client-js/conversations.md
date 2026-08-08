> Discover all available pages from the documentation index: https://mastra.ai/llms.txt

# OpenAI Responses API Conversations

The OpenAI Responses API Conversations surface gives you the conversation-management side of Mastra Agents as a Responses API. It provides methods to create, retrieve, delete, and inspect thread-backed conversations in Mastra.

This API follows up on the [OpenAI Responses API](https://mastra.ai/reference/client-js/responses). Stored Responses calls return `conversation_id`, and in Mastra that value is the raw memory `threadId`. Use `client.conversations` when you want to work with that thread directly.

This API is currently experimental.

## Relationship to OpenAI Responses

Use the OpenAI Responses API for generation and continuation:

```typescript
const response = await client.responses.create({
  agent_id: 'support-agent',
  input: 'Start a support thread',
  store: true,
})

console.log(response.conversation_id)
```

Use the Conversations API when you want to inspect or manage that stored thread:

```typescript
const conversation = await client.conversations.retrieve(response.conversation_id!)
const items = await client.conversations.items.list(response.conversation_id!)
```

## Usage example

```typescript
import { MastraClient } from '@mastra/client-js'

const client = new MastraClient({
  baseUrl: 'http://localhost:4111',
})

const conversation = await client.conversations.create({
  agent_id: 'support-agent',
})

console.log(conversation.id)
```

## Methods

### Lifecycle

#### `create(params)`

Creates a new conversation thread for the selected agent.

```typescript
const conversation = await client.conversations.create({
  agent_id: 'support-agent',
  title: 'Billing support',
})
```

**Returns:** `Promise<Conversation>`.

#### `retrieve(conversationId, requestContext?)`

Retrieves a conversation by its thread ID.

```typescript
const conversation = await client.conversations.retrieve('thread_123')

console.log(conversation.thread)
```

**Returns:** `Promise<Conversation>`.

#### `delete(conversationId, requestContext?)`

Deletes a conversation by its thread ID.

```typescript
const deleted = await client.conversations.delete('thread_123')

console.log(deleted.deleted)
```

**Returns:** `Promise<ConversationDeleted>`.

### Items

#### `items.list(conversationId, requestContext?)`

Lists the stored items for a conversation.

```typescript
const items = await client.conversations.items.list('thread_123')

console.log(items.data)
```

**Returns:** `Promise<ConversationItemsPage>`.

## Response shape

`create()` and `retrieve()` return a conversation object with:

- `id`: The raw thread ID
- `object`: Always `'conversation'`
- `thread`: The stored thread record

`delete()` returns:

- `id`: The raw thread ID
- `object`: Always `'conversation.deleted'`
- `deleted`: Always `true`

`items.list()` returns:

- `object`: Always `'list'`
- `data`: Conversation items such as `message`, `function_call`, and `function_call_output`
- `first_id`: The first item ID in the page
- `last_id`: The last item ID in the page
- `has_more`: Whether more items exist beyond the current page

## Parameters

**agent\_id** (`string`): Required. The registered Mastra agent that owns the conversation memory.

**conversation\_id** (`string`): Optional conversation ID to use as the raw thread ID.

**resource\_id** (`string`): Optional resource ID to associate with the conversation thread.

**title** (`string`): Optional thread title stored with the conversation.

**metadata** (`Record<string, unknown>`): Optional thread metadata stored with the conversation.

**requestContext** (`RequestContext | Record<string, any>`): Optional request context forwarded to the Mastra server.