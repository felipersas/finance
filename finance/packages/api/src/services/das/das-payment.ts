import prisma from "@finance/db";

/**
 * Consulta o estado de pagamento do DAS para um usuário e mês.
 * @param userId - ID do usuário
 * @param month - Mês no formato "YYYY-MM"
 * @returns Objeto com status de pagamento e data de pagamento (se houver)
 */
export async function getDasPaymentStatus(userId: string, month: string) {
  const payment = await prisma.dasPayment.findUnique({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
  });

  return {
    paid: payment?.paid ?? false,
    paidAt: payment?.paidAt ?? null,
  };
}

/**
 * Marca o DAS como pago para um usuário e mês.
 * @param userId - ID do usuário
 * @param month - Mês no formato "YYYY-MM"
 * @returns Registro atualizado
 */
export async function markDasAsPaid(userId: string, month: string) {
  const now = new Date();
  const payment = await prisma.dasPayment.upsert({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
    update: {
      paid: true,
      paidAt: now,
    },
    create: {
      userId,
      month,
      paid: true,
      paidAt: now,
    },
  });

  return payment;
}
