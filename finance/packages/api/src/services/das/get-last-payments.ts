import prisma from "@finance/db";
import type { DasPaymentModel } from "@finance/db";

/**
 * Busca os 5 últimos pagamentos de DAS do usuário, ordenados do mais recente para o mais antigo.
 * @param userId - ID do usuário
 * @returns Array de pagamentos de DAS
 */
export async function getLastDasPayments(userId: string): Promise<DasPaymentModel[]> {
  return await prisma.dasPayment.findMany({
    where: { userId },
    orderBy: { month: "desc" },
    take: 5,
  });
}
