import { Controller, Post, Body, Inject } from '@nestjs/common';
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
  ): Promise<any> {
    return this.chatbotService.chat(chatDto.query, user.userId);
  }
}
