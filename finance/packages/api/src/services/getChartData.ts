import prisma from "@finance/db"

/**
 * Retrieves daily chart data for a user, aggregating entries (entrada) and exits (saida)
 * for the specified time range.
 *
 * @param range - The period to aggregate data for ("7d", "30d", or "90d").
 * @param userId - The ID of the user whose data will be fetched.
 * @returns An array of objects, each representing a day with its date, total entries, and total exits.
 *
 * Each object in the result has the following structure:
 *   {
 *     date: string;      // Date in "YYYY-MM-DD" format
 *     entrada: number;   // Total entry value for the day (always positive)
 *     saida: number;     // Total exit value for the day (always positive)
 *   }
 *
 * Days with no records will have entrada and saida as 0.
 */
export const getCharData = async (range: "30d" | "7d" | "90d", userId: string) => {
  const referenceDate = new Date("2025-03-15");
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
