import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvModule } from './modules/csv/csv.module';
import { PrismaService } from './prisma.service';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { ExtractsModule } from './modules/extracts/extracts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CsvModule,
    ChatbotModule,
    AuthModule,
    UserModule,
    ExtractsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
