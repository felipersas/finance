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

    // Build the payload according to Mastra API spec
    const payload: {
      messages: Array<{
        role: string;
        content: Array<{ type: string; text: string }>;
      }>;
      resourceId?: string;
      threadId?: string;
      runId?: string;
      structuredOutput?: any;
      tracingOptions?: any;
    } = {
      messages: [{ role: 'user', content: [{ type: 'text', text: query }] }],
      resourceId: userId,
      // threadId is required when agent uses Memory
      threadId: `thread-${userId}`,
      // Optional: uncomment to add custom runId
      // runId: `run-${Date.now()}`,
      // Optional: uncomment to enable structured output
      // structuredOutput: {
      //   schema: {},
      //   model: 'gpt-4o-mini',
      //   instructions: 'Return structured data',
      //   errorStrategy: 'strict',
      // },
      // Optional: uncomment to add tracing metadata
      // tracingOptions: {
      //   metadata: {
      //     userId: userId,
      //   },
      // },
    };

    // Use generate endpoint instead of stream to get only final response
    const response: any = await this.externalHttpService.post(
      `${this.apiURL}/api/agents/sqlAgent/generate`,
      payload,
      {
        serviceName: 'chatbot-service',
        timeout: 300000, // 5 minutes for generation
        additionalHeaders: headers,
      },
    );

    // Return the raw response from the external API without any processing
    return response;
  }
}
