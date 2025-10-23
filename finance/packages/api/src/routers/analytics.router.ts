import { protectedProcedure, router } from "../index";
import prisma  from "@finance/db";

export const analyticsRouter = router({
  totalRevenue: protectedProcedure
    .query(async ({ ctx }) => {
      const sum = await prisma.extratoRecord.aggregate({
        _sum: {
          valor: true,
        },
        where: {
          userId: ctx.session.user.id,
          valor: {
            gt: 0,
          },
        },
      });

      return sum._sum.valor ?? 0;
    }),
});
