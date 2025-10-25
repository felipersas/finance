"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/trpc-client";

export interface UseTransactionsParams {
  page?: number;
  search?: string;
  month?: string;
}

export const useTransactions = ({
  page = 1,
  search = "",
  month,
}: UseTransactionsParams = {}) => {
  const trpc = useTRPC();

  const { data, error, isLoading, refetch, isFetching } = useQuery(
    trpc.transactions.getTransactions.queryOptions({
      page,
      search,
      month,
    }),
  );

  return {
    data: {
      items: data?.items ?? [],
      count: data?.count ?? 0,
      page: data?.page ?? page,
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
