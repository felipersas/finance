import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserBalance(userId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return await this.prisma.extratoRecord.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        userId,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });
  }

  async findUser7daysActivity(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const records = await this.prisma.extratoRecord.findMany({
      where: {
        userId,
        valor: { lt: 0 },
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        valor: true,
        createdAt: true,
      },
    });

    const spentPerDay: Record<string, number> = {};
    for (const rec of records) {
      const day = rec.createdAt.toISOString().slice(0, 10);
      const value =
        typeof rec.valor === 'object' &&
        typeof rec.valor.toNumber === 'function'
          ? rec.valor.toNumber()
          : Number(rec.valor);
      spentPerDay[day] = (spentPerDay[day] || 0) + value;
    }

    return Object.entries(spentPerDay)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
