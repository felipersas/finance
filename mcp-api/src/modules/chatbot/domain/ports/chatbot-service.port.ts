export interface ChatbotServicePort {
  chat(query: string, userId: string): Promise<any>;
}
