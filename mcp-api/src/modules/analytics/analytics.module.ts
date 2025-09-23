import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AnalyticsService } from './domain/services/analytics.service';
import { AnalyticsController } from './infrastructure/adapters/controllers/analytics.controller';
import { AnalyticsRepository } from './infrastructure/repositories/analytics.repository';

@Module({
  controllers: [AnalyticsController],
  providers: [
    {
      provide: 'AnalyticsRepositoryPort',
      useClass: AnalyticsRepository,
    },
    {
      provide: 'AnalyticsServicePort',
      useClass: AnalyticsService,
    },
    AnalyticsService,
    AnalyticsRepository,
    PrismaService,
  ],
  exports: [
    {
      provide: 'AnalyticsRepositoryPort',
      useClass: AnalyticsRepository,
    },
    {
      provide: 'AnalyticsServicePort',
      useClass: AnalyticsService,
    },
  ],
})
export class AnalyticsModule {}
