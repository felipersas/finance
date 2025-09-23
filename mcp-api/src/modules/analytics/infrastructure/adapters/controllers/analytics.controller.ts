import { Controller, Get } from '@nestjs/common';
import type { AnalyticsServicePort } from '../../../domain/ports/analytics-service.port';
import { Inject } from '@nestjs/common';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/domain/services/jwt.strategy';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject('AnalyticsServicePort')
    private readonly analyticsService: AnalyticsServicePort,
  ) {}

  @Get('')
  async getUserAnalytics(@CurrentUser() user: JwtUser) {
    const data = await this.analyticsService.getUserAnalytics(user.userId);
    return {
      message: 'Dados de usuário encontrados com sucesso',
      data,
    };
  }
}
