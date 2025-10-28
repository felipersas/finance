import prisma from "@finance/db"

/**
 * Busca dados agregados de entradas e saídas diárias para o gráfico do dashboard.
 *
 * @param range - Intervalo de dias para o gráfico ("7d", "30d" ou "90d")
 * @param userId - ID do usuário para filtrar os registros
 * @returns Array de objetos contendo data, entrada (receita) e saída (despesa) por dia
 *
 * @example
 * const data = await getCharData("30d", "user-123");
 * // data: [{ date: "2024-06-01", entrada: 1000, saida: 500 }, ...]
 */
export const getCharData = async (range: "30d" | "7d" | "90d", userId: string) => {
  const referenceDate = new Date();
  referenceDate.setUTCHours(0, 0, 0, 0);

  let daysToSubtract = 90;
  if (range === "30d") daysToSubtract = 30;
  if (range === "7d") daysToSubtract = 7;

  const startDate = new Date(referenceDate);
  startDate.setDate(referenceDate.getDate() - daysToSubtract);

  const records = await prisma.extratoRecord.findMany({
    where: {
      userId,
      data: {
        gte: startDate,
        lte: referenceDate,
      },
    },
    select: {
      data: true,
      valor: true,
    },
    orderBy: {
      data: "asc",
    },
  });

  const dailyMap: Record<string, { entrada: number; saida: number }> = {};

  for (const rec of records) {
    const dateStr = rec.data.toISOString().slice(0, 10);
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = { entrada: 0, saida: 0 };
    }
    if (Number(rec.valor) >= 0) {
      dailyMap[dateStr].entrada += Number(rec.valor);
    } else {
      dailyMap[dateStr].saida += Math.abs(Number(rec.valor));
    }
  }

  const result: { date: string; entrada: number; saida: number }[] = [];
  for (let i = 0; i <= daysToSubtract; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({
      date: dateStr,
      entrada: dailyMap[dateStr]?.entrada ?? 0,
      saida: dailyMap[dateStr]?.saida ?? 0,
    });
  }

  return result;
}
