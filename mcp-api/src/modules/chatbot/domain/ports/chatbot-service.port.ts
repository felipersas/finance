export interface ChatbotServicePort {
  chat(query: string, userId: string, token?: string): Promise<any>;
}
