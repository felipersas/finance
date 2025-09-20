import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getUserAnalytics(userId: string) {
    const balance = await this.analyticsRepository.findUserBalance(userId);
    const spentPerDay =
      await this.analyticsRepository.findUser7daysActivity(userId);

    return {
      balance: Number(balance._sum.valor) || 0,
      spentPerDay,
    };
  }
}
