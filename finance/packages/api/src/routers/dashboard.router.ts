import { protectedProcedure, router } from "../index";
import { z } from "zod";
import { getResumedBalance } from "../services/getResumedBalance";
import { getCharData } from "../services/getChartData";

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
});
