import { protectedProcedure, router } from "../index";
import { z } from "zod";
import { getResumedBalance } from "../services/getResumedBalance";
import { getCharData } from "../services/getChartData";
import { getTransactions } from "../services/getTransactions";
import { getDasDueDays } from "../services/das/das-due-days";
import { getDasPaymentStatus, markDasAsPaid } from "../services/das/das-payment";
import { getLastDasPayments } from "../services/das/get-last-payments";



export const dashboardRouter = router({
  sectionCards: protectedProcedure
    .query(async ({ ctx }) => {
      return await getResumedBalance(ctx.session.user.id);
    }),

  areaChartData: protectedProcedure
    .input(z.object({
      range: z.enum(["7d", "30d", "90d"]).default("90d"),
    }))
    .query(async ({ ctx, input }) => {
      return await getCharData(input.range, ctx.session.user.id);
    }),
  lastTransactions: protectedProcedure
    .query(async ({ ctx }) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
      const { items } = await getTransactions({
        userId: ctx.session.user.id,
        page: 1,
        perPage: 5,
        month: monthStr,
      });
      return items;
    }),

  dasDueDays: protectedProcedure
    .query(async ({ ctx }) => {
      // Retorna dias restantes + status de pagamento do DAS do mês corrente
      const dasDue = getDasDueDays();
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + (now.getDate() > 20 ? 1 : 0);
      const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
      const paymentStatus = await getDasPaymentStatus(ctx.session.user.id, monthStr);

      return {
        ...dasDue,
        paymentStatus,
        month: monthStr,
      };
    }),

  markDasAsPaid: protectedProcedure
    .input(z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
    }))
    .mutation(async ({ ctx, input }) => {
      // Marca o DAS como pago para o mês informado
      const payment = await markDasAsPaid(ctx.session.user.id, input.month);
      return {
        success: true,
        payment,
      };
    }),
  lastDasPayments: protectedProcedure
    .query(async ({ ctx }) => {
      // Retorna os 5 últimos pagamentos de DAS do usuário
      return await getLastDasPayments(ctx.session.user.id);
    }),
});
