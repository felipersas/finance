import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatDto } from './dto/chat.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/strategies/jwt.strategy';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('/chat')
  async chat(
    @Body() chatDto: ChatDto,
    @CurrentUser() user: JwtUser,
  ): Promise<any> {
    return this.chatbotService.chat(chatDto.query, user.userId);
  }
}
