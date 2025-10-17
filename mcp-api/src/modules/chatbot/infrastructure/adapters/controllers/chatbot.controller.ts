import { Controller, Post, Body, Inject, Headers } from '@nestjs/common';
import type { ChatbotServicePort } from '../../../domain/ports/chatbot-service.port';
import { ChatDto } from '../../../dto/chat.dto';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/services/jwt.strategy';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    @Inject('ChatbotServicePort')
    private readonly chatbotService: ChatbotServicePort,
  ) {}

  @Post('/chat')
  async chat(
    @Body() chatDto: ChatDto,
    @CurrentUser() user: JwtUser,
    @Headers('authorization') authHeader?: string,
  ): Promise<any> {
    const token = authHeader?.replace('Bearer ', '');
    return this.chatbotService.chat(chatDto.query, user.userId, token);
  }
}
