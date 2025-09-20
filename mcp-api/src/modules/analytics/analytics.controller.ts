import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/strategies/jwt.strategy';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('')
  async getUserAnalytics(@CurrentUser() user: JwtUser) {
    return {
      message: 'Dados de usuário encontrados com sucesso',
      data: await this.analyticsService.getUserAnalytics(user.userId),
    };
  }
}
