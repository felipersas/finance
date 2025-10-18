export interface MessageContent {
  type: 'text';
  text: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: MessageContent[];
  id?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface ChatResponse {
  [key: string]: any;
}

export interface StreamChunk {
  messages: ChatMessage[];
}
