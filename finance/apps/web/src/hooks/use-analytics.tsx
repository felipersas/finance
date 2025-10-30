"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/trpc-client";

export const useSectionCards = () => {
  const trpc = useTRPC();
  const { data: response } = useSuspenseQuery(
    trpc.dashboard.sectionCards.queryOptions(),
  );

  return {
    response,
  };
};

export const useDasDueDays = () => {
  const trpc = useTRPC();
  const { data: dasDue } = useSuspenseQuery(
    trpc.dashboard.dasDueDays.queryOptions(),
  );

  return {
    dasDue,
  };
};

export const useMarkDasAsPaid = () => {
  const trpc = useTRPC();

  return useMutation(trpc.dashboard.markDasAsPaid.mutationOptions());
};

export const useLastTransactions = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.dashboard.lastTransactions.queryOptions(),
  );

  return {
    transactions: data ?? [],
  };
};

export const useLastDasPayments = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.dashboard.lastDasPayments.queryOptions(),
  );

  return {
    dasPayments: data ?? [],
  };
};
