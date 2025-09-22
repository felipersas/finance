import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserBalance(
    userId: string,
    where?: Prisma.ExtratoRecordWhereInput,
  ) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return await this.prisma.extratoRecord.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        ...where,
        userId,
        createdAt: {
          gte: firstDayOfMonth,
          ...(<Prisma.ExtratoRecordWhereInput>where?.createdAt || {}),
        },
      },
    });
  }

  async findUser7daysActivity(
    userId: string,
    where?: Prisma.ExtratoRecordWhereInput,
  ) {
    const now = new Date();
    const start = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 6,
        0,
        0,
        0,
        0,
      ),
    );
    const end = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    console.log({ start, end });

    const records = await this.prisma.extratoRecord.findMany({
      where: {
        ...where,
        userId,
        data: {
          // <-- use "data" aqui!
          gte: start,
          lte: end,
        },
        valor: { lt: 0 }, // só gastos
      },
      orderBy: { data: 'asc' },
      select: { valor: true, data: true },
    });

    console.log(records);

    const spentPerDay: Record<string, number> = {};
    for (const rec of records) {
      const day = rec.data.toISOString().slice(0, 10);
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
