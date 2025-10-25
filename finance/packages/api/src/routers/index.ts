import { protectedProcedure, publicProcedure, router } from "../index";
import { productsRouter } from "./products.router";
import { usersRouter } from "./users.router";
import { csvRouter } from "./csv.router";
import { dashboardRouter } from "./dashboard.router";
import { transactionsRouter } from "./transactions.router";

export const appRouter = router({
  users: usersRouter,
  products: productsRouter,
  csv: csvRouter,
  dashboard: dashboardRouter,
  transactions: transactionsRouter,
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
});
export type AppRouter = typeof appRouter;
