import prisma from "@finance/db";


export interface Transaction {
  id: string;
  userId?: string;
  data: string;
  valor: number | string;
  identificador: string;
  descricao?: string;
  tipoOperacao?: string;
  remetenteDestinatario?: string;
  documento?: string;
  instituicaoFinanceira?: string;
  codigoBanco?: string;
  agencia?: string;
  conta?: string;
  tipo?: string;
  createdAt: string;
}

export interface GetTransactionsResult {
  transactions: Transaction[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Busca transações paginadas e filtradas por descrição para um usuário.
 * @param params - Parâmetros de busca
 * @param params.userId - ID do usuário
 * @param params.page - Página atual (default: 1)
 * @param params.perPage - Itens por página (default: 10)
 * @param params.search - Texto de busca na descrição (opcional)
 * @returns { transactions, count, page, perPage, totalPages }
 */
export async function getTransactions({
  userId,
  page = 1,
  perPage = 10,
  search = "",
}: {
  userId: string;
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<{
  transactions: Transaction[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
}> {
  const where: any = { userId };
  if (search && search.trim() !== "") {
    where.descricao = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [transactionsRaw, count] = await Promise.all([
    prisma.extratoRecord.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.extratoRecord.count({
      where,
    }),
  ]);

  const transactions: Transaction[] = transactionsRaw.map(tx => ({
    id: tx.id,
    userId: tx.userId ?? undefined,
    data: tx.data instanceof Date ? tx.data.toISOString() : String(tx.data),
    valor: typeof tx.valor === "object" && "toNumber" in tx.valor ? tx.valor.toNumber() : Number(tx.valor),
    identificador: tx.identificador,
    descricao: tx.descricao ?? undefined,
    tipoOperacao: tx.tipoOperacao ?? undefined,
    remetenteDestinatario: tx.remetenteDestinatario ?? undefined,
    documento: tx.documento ?? undefined,
    instituicaoFinanceira: tx.instituicaoFinanceira ?? undefined,
    codigoBanco: tx.codigoBanco ?? undefined,
    agencia: tx.agencia ?? undefined,
    conta: tx.conta ?? undefined,
    tipo: tx.tipo ?? undefined,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : String(tx.createdAt),
  }));


  return {
    transactions,
    count,
    page,
    perPage,
    totalPages: Math.ceil(count / perPage),
  };
}
