import { Module } from '@nestjs/common';
import { ChatbotService } from './domain/services/chatbot.service';
import { ChatbotController } from './infrastructure/adapters/controllers/chatbot.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ExternalHttpService } from 'src/common/services/external-http.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [ChatbotController],
  providers: [
    ExternalHttpService,
    {
      provide: 'ChatbotServicePort',
      useClass: ChatbotService,
    },
    ChatbotService,
  ],
  exports: [
    {
      provide: 'ChatbotServicePort',
      useClass: ChatbotService,
    },
    ChatbotService,
  ],
})
export class ChatbotModule {}
