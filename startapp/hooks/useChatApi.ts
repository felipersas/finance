import { api } from '@/services/api';
import { apiResponse } from '@/types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface ChatRequest {
  query: string;
}

interface ChatResponse {
  response: string;
  conversationId: string;
}

const sendChatMessage = async (message: ChatRequest): Promise<apiResponse<ChatResponse>> => {
  const request = api.post<apiResponse<ChatResponse>>(
    '/chatbot/chat',
    message,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return requestHandler(request);
};

export const useChatMutation = () => {
  return useMutation({
    mutationFn: sendChatMessage,
    onError: (error) => {
      console.error('Chat API Error:', error);
    },
  });
};

export type { ChatRequest, ChatResponse };
