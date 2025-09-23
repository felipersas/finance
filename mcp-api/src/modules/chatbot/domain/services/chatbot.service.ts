import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExternalHttpService } from 'src/common/services/external-http.service';
import type { ChatbotServicePort } from '../ports/chatbot-service.port';

@Injectable()
export class ChatbotService implements ChatbotServicePort {
  private apiURL: string = '';

  constructor(
    private readonly externalHttpService: ExternalHttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiURL = this.configService.get<string>('CHATBOT_URL') || this.apiURL;
  }

  async chat(query: string, userId: string): Promise<any> {
    return this.externalHttpService.post(
      `${this.apiURL}/chat`,
      {
        query: query,
        userId: userId,
        timestamp: new Date().toISOString(),
      },
      {
        serviceName: 'chatbot-service',
        timeout: 30000,
      },
    );
  }
}
