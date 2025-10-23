import { protectedProcedure, publicProcedure, router } from "../index";
import { productsRouter } from "./products.router";
import { usersRouter } from "./users.router";
import { csvRouter } from "./csv.router";
import { analyticsRouter } from "./analytics.router";

export const appRouter = router({
  users: usersRouter,
  products: productsRouter,
  csv: csvRouter,
  analytics: analyticsRouter,
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
