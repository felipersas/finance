import { protectedProcedure, publicProcedure, router } from "../index";
import { z } from "zod";

export const productsRouter = router({
  // Rota pública: listar produtos
  list: publicProcedure.query(() => [
    { id: 1, name: "Produto A" },
    { id: 2, name: "Produto B" }
  ]),

  // Rota protegida: criar produto
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input, ctx }) => ({
      id: Math.floor(Math.random() * 10000),
      name: input.name,
      createdBy: ctx.session.user?.id ?? null
    })),

  // Rota pública: buscar produto por id
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => ({
      id: input.id,
      name: `Produto ${input.id}`
    })),

  // Rota protegida: deletar produto
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => ({
      success: true,
      deletedId: input.id,
      deletedBy: ctx.session.user?.id ?? null
    }))
});
