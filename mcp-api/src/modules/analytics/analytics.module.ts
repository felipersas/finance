import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository, PrismaService],
})
export class AnalyticsModule {}
