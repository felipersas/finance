import { Injectable, Inject } from '@nestjs/common';
import type { AnalyticsServicePort } from '../ports/analytics-service.port';
import type { AnalyticsRepositoryPort } from '../ports/analytics-repository.port';

@Injectable()
export class AnalyticsService implements AnalyticsServicePort {
  constructor(
    @Inject('AnalyticsRepositoryPort')
    private readonly analyticsRepository: AnalyticsRepositoryPort,
  ) {}

  async getUserAnalytics(userId: string): Promise<{
    saldoTotal: number;
    saldoEmpresa: number;
    saldoPessoal: number;
    gastosPorDia: Array<{
      date: string;
      total: number;
      totalEmpresa: number;
      totalPessoal: number;
    }>;
  }> {
    const totalBalance = await this.analyticsRepository.findUserBalance(userId);

    const [gastosPorDiaTotal, gastosPorDiaEmpresa, gastosPorDiaPessoal] =
      await Promise.all([
        this.analyticsRepository.findUser7daysActivity(userId),
        this.analyticsRepository.findUser7daysActivity(userId, {
          tipo: 'Empresa',
        }),
        this.analyticsRepository.findUser7daysActivity(userId, {
          tipo: 'Pessoal',
        }),
      ]);

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const gastosPorDia = last7Days.map((dateObj) => {
      const date = dateObj.toISOString().slice(0, 10);
      const dayName = diasSemana[dateObj.getDay()];
      return {
        date: dayName,
        total: gastosPorDiaTotal.find((g) => g.date === date)?.total || 0,
        totalEmpresa:
          gastosPorDiaEmpresa.find((g) => g.date === date)?.total || 0,
        totalPessoal:
          gastosPorDiaPessoal.find((g) => g.date === date)?.total || 0,
      };
    });

    const totalBusiness = await this.analyticsRepository.findUserBalance(
      userId,
      { tipo: 'Empresa' },
    );
    const totalPersonal = await this.analyticsRepository.findUserBalance(
      userId,
      { tipo: 'Pessoal' },
    );

    return {
      saldoTotal: Number(totalBalance._sum.valor) || 0,
      saldoEmpresa: Number(totalBusiness._sum.valor) || 0,
      saldoPessoal: Number(totalPersonal._sum.valor) || 0,
      gastosPorDia,
    };
  }
}
