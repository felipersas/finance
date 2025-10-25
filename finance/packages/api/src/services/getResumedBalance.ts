import prisma from "@finance/db";

export const getResumedBalance = async (userId: string) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [currentEarnings, prevEarnings, currentExpenses, prevExpenses] = await Promise.all([
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
    prisma.extratoRecord.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        userId,
        valor: {
          lt: 0,
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
          lt: 0,
        },
        data: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    }),
  ]);

  const currentEarningsValue = Number(currentEarnings._sum.valor ?? 0);
  const prevEarningsValue = Number(prevEarnings._sum.valor ?? 0);
  const currentExpensesValue = Math.abs(Number(currentExpenses._sum.valor ?? 0)); // Make positive for display
  const prevExpensesValue = Math.abs(Number(prevExpenses._sum.valor ?? 0));

  const calculatePercent = (current: number, prev: number) => {
    if (prev === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - prev) / prev) * 100;
  };

  const earningsPercent = calculatePercent(currentEarningsValue, prevEarningsValue);
  const expensesPercent = calculatePercent(currentExpensesValue, prevExpensesValue);

  const currentNet = currentEarningsValue - currentExpensesValue;
  const prevNet = prevEarningsValue - prevExpensesValue;
  const netPercent = calculatePercent(currentNet, prevNet);

  return {
    revenue: { total: currentEarningsValue, percent: earningsPercent },
    expenses: { total: currentExpensesValue, percent: expensesPercent },
    net: { total: currentNet, percent: netPercent },
  };
}
