import prisma from "@finance/db";

export const getAnalytics = async (userId: string) => {
  const now = new Date("2025-02-27");
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [currentSum, prevSum] = await Promise.all([
    prisma.extratoRecord.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        userId,
        valor: {
          gt: 0,
        },
        data: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    }),
    prisma.extratoRecord.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        userId,
        valor: {
          gt: 0,
        },
        data: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    }),
  ]);

  const current = Number(currentSum._sum.valor ?? 0);
  const prev = Number(prevSum._sum.valor ?? 0);
  let percent = 0;
  if (prev === 0) {
    percent = current > 0 ? 100 : 0;
  } else {
    percent = ((current - prev) / prev) * 100;
  }

  return { total: current, percent };
}
