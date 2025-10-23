import { protectedProcedure, router } from "../index";
import { getAnalytics } from "../services/getAnalytics";

export const analyticsRouter = router({
  totalRevenue: protectedProcedure
    .query(async ({ ctx }) => {

      return await getAnalytics(ctx.session.user.id);
    }),
});
