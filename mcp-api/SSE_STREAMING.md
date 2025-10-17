# SSE Streaming Documentation

## Overview

This document describes how Server-Sent Events (SSE) streaming works in the chatbot endpoints. The API acts as a transparent proxy, forwarding SSE events from the external Mastra chatbot service to the client.

## Architecture

```
Client → API (/chat/stream) → External Chatbot Service → SSE Stream → Client
```

The implementation uses Node.js streams to pipe SSE events directly from the external service to the client without buffering or modification.

## Endpoints

### POST /chatbot/chat/stream

Streams chatbot responses using Server-Sent Events.

**Request:**
```json
{
  "query": "What is the weather today?"
}
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
- Content-Type: `text/event-stream`
- Connection: `keep-alive`
- Cache-Control: `no-cache`

## Implementation Details

### Service Layer (`chatbot.service.ts`)

The `chatStream` method uses `ExternalHttpService.postStream()` to establish an SSE connection:

```typescript
async chatStream(query: string, userId: string, token?: string): Promise<Readable> {
  const stream = await this.externalHttpService.postStream(
    `${this.apiURL}/api/agents/sqlAgent/stream`,
    {
      messages: [{ role: 'user', content: [{ type: 'text', text: query }] }],
      options: { format: 'mastra' }
    },
    {
      serviceName: 'chatbot-service',
      timeout: 300000, // 5 minutes for streaming
      additionalHeaders: headers
    }
  );
  return stream;
}
```

### HTTP Service Layer (`external-http.service.ts`)

The `postStream` method configures axios to return a stream:

```typescript
async postStream(url: string, data: any, options: ExternalRequestOptions = {}): Promise<Readable> {
  const response = await firstValueFrom(
    this.httpService.post(url, data, {
      headers: {
        ...headers,
        Accept: 'text/event-stream'
      },
      timeout,
      responseType: 'stream' // Critical for SSE
    })
  );
  return response.data as Readable;
}
```

### Controller Layer (`chatbot.controller.ts`)

The controller pipes the stream to the response:

```typescript
const stream = await this.chatbotService.chatStream(chatDto.query, user.userId, token);

// Pipe events directly to client
stream.on('data', (chunk) => {
  res.write(chunk);
});

stream.on('end', () => {
  res.end();
});

stream.on('error', (error) => {
  res.write(`event: error\ndata: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
  res.end();
});

// Handle client disconnect
res.on('close', () => {
  stream.destroy();
});
```

## Event Format

Events are forwarded as-is from the external Mastra service. Expected format:

```
data: {"type":"text-delta","payload":{"text":"Hello"},"runId":"123","from":"AGENT"}

data: {"type":"tool-call","payload":{"toolName":"weather","args":{}},"runId":"123","from":"AGENT"}

data: {"type":"finish","payload":{...},"runId":"123","from":"AGENT"}

event: end
data: {}
```

## Key Features

1. **Zero Processing**: Events are streamed directly without modification
2. **Backpressure Handling**: Node.js streams handle flow control automatically
3. **Error Handling**: Errors are caught and sent as SSE error events
4. **Client Disconnect**: Upstream connection is destroyed when client disconnects
5. **Long Timeout**: 5-minute timeout for long-running operations

## Error Handling

### Network Errors
If the external service fails, an error event is sent:
```
event: error
data: {"error":"Streaming failed"}
```

### Client Disconnect
When the client closes the connection, the upstream stream is destroyed to prevent resource leaks.

### Timeout
Requests timeout after 300 seconds (5 minutes). Adjust in service configuration if needed.

## Testing

### Using curl:
```bash
curl -N -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"Hello"}' \
  http://localhost:3000/chatbot/chat/stream
```

### Using JavaScript:
```javascript
const eventSource = new EventSource('/chatbot/chat/stream', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify({ query: 'Hello' })
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data);
};

eventSource.addEventListener('end', () => {
  eventSource.close();
});

eventSource.onerror = (error) => {
  console.error('Error:', error);
};
```

## Performance Considerations

1. **Memory**: Streaming prevents buffering entire responses in memory
2. **Latency**: Events appear in real-time as they're generated
3. **Scalability**: Each connection maintains minimal overhead
4. **Cleanup**: Proper event listener cleanup prevents memory leaks

## Troubleshooting

### Events not received
- Check `Accept: text/event-stream` header is set
- Verify `responseType: 'stream'` in axios config
- Ensure client keeps connection open

### Duplicate events
- Events are forwarded as-is from upstream
- Check external service for duplicate emission
- Add client-side deduplication if needed

### Connection drops
- Check timeout configuration (default: 5 minutes)
- Verify network stability
- Monitor server logs for errors

## Environment Variables

```
CHATBOT_URL=<external-mastra-service-url>
INTERNAL_API_TOKEN=<service-auth-token>
```
