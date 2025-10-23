import { protectedProcedure, publicProcedure, router } from "../index";
import { z } from "zod";

export const usersRouter = router({
  // Rota pública: listar usuários
  list: publicProcedure.query(() => [
    { id: 1, name: "Usuário X" },
    { id: 2, name: "Usuário Y" }
  ]),

  // Rota protegida: criar usuário
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email()
    }))
    .mutation(({ input, ctx }) => ({
      id: Math.floor(Math.random() * 10000),
      name: input.name,
      email: input.email,
      createdBy: ctx.session.user?.id ?? null
    })),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => ({
      success: true,
      deletedId: input.id,
      deletedBy: ctx.session.user?.id ?? null
    }))
});
