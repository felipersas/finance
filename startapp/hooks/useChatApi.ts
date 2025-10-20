import { api } from '@/services/api';
import { ApiResponse } from '@/types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';
import { useMutation } from '@tanstack/react-query';

interface ChatRequest {
  query: string;
}

interface ChatResponse {
  text: string;
}

const sendChatMessage = async (message: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
  const request = api.post<ApiResponse<ChatResponse>>(
    '/chatbot/chat',
    message,
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
