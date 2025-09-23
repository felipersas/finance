import type { UserBalance, UserDayActivity } from '../types/analytics.types';

export interface AnalyticsServicePort {
  getUserAnalytics(userId: string): Promise<{
    saldoTotal: number;
    saldoEmpresa: number;
    saldoPessoal: number;
    gastosPorDia: Array<{
      date: string;
      total: number;
      totalEmpresa: number;
      totalPessoal: number;
    }>;
  }>;
}
