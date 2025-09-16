import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ExternalHttpService } from 'src/common/services/external-http.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, ExternalHttpService],
})
export class ChatbotModule {}
