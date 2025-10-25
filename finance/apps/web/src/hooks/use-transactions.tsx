"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/trpc-client";

export interface UseTransactionsParams {
  page?: number;
  search?: string;
}

export const useTransactions = ({
  page = 1,
  search = "",
}: UseTransactionsParams = {}) => {
  const trpc = useTRPC();

  // Garante que page é sempre número e search é sempre string
  const safePage = typeof page === "string" ? parseInt(page, 10) || 1 : page;
  const safeSearch = typeof search === "string" ? search : "";

  const { data, error, isLoading, refetch, isFetching } = useQuery(
    trpc.transactions.getTransactions.queryOptions({
      page: safePage,
      search: safeSearch,
    }),
  );

  // Estrutura esperada do retorno do backend via buildPaginatedResponse:
  // {
  //   items: Transaction[],
  //   count: number,
  //   page: number,
  //   perPage: number,
  //   totalPages: number
  // }

  return {
    data: {
      items: data?.items ?? [],
      count: data?.count ?? 0,
      page: data?.page ?? safePage,
      perPage: data?.perPage ?? 10,
      totalPages: data?.totalPages ?? 1,
    },
    isLoading,
    isFetching,
    isError: !!error,
    error,
    refetch,
  };
};
