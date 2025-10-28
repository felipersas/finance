import { protectedProcedure, router } from "../index";
import { z } from "zod";
import { buildPaginatedResponse } from "../utils/build-paginated-response";
import { getTransactions } from "../services/getTransactions";

export const transactionsRouter = router({
  getTransactions: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      search: z.string().optional(),
      month: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const perPage = 10;
      const page = input.page;
      const search = input.search ?? "";
      const month = input.month;

      const result = await getTransactions({
        userId,
        page,
        perPage,
        search,
        month,
      });

      return result;
    }),
})
