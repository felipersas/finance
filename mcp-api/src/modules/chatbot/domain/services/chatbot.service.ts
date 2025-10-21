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

  async chat(query: string, userId: string, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: query,
            },
          ],
        },
      ],
      runId: 'sqlAgent',
      maxSteps: 2,
      modelSettings: {
        maxRetries: 2,
        maxOutputTokens: 4096,
        temperature: 0,
      },
      threadId: userId,
      resourceId: 'sqlAgent',
    };

    const response: { text: string } = await this.externalHttpService.post(
      `${this.apiURL}/api/agents/sqlAgent/generate`,
      payload,
      {
        serviceName: 'chatbot-service',
        timeout: 300000,
        additionalHeaders: headers,
      },
    );

    return {
      text: response.text,
    };
  }
}
