import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './domain/services/notification.service';
import { NotificationController } from './infrastructure/adapters/controllers/notification.controller';
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [NotificationController],
  providers: [
    {
      provide: 'NotificationRepositoryPort',
      useClass: NotificationRepository,
    },
    {
      provide: 'NotificationServicePort',
      useClass: NotificationService,
    },
    NotificationService,
    NotificationRepository,
    PrismaService,
    ConfigService,
  ],
  exports: [
    NotificationService,
    {
      provide: 'NotificationServicePort',
      useClass: NotificationService,
    },
  ],
})
export class NotificationModule {}
