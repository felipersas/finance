import { protectedProcedure, router } from "../index";
import { z } from "zod";
import { getResumedBalance } from "../services/getResumedBalance";
import { getCharData } from "../services/getChartData";
import { getTransactions } from "../services/getTransactions";
import { getDasDueDays } from "../services/das/das-due-days";



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
      const { transactions } = await getTransactions({
        userId: ctx.session.user.id,
        page: 1,
        perPage: 5,
        month: monthStr,
      });
      return transactions;
    }),

  dasDueDays: protectedProcedure
    .query(async () => {
      // Não depende de usuário, apenas da data atual
      return getDasDueDays();
    }),
});
