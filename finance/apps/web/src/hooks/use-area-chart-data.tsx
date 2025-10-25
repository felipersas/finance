"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/trpc-client";

type RangeType = "7d" | "30d" | "90d";

export interface AreaChartDataItem {
  date: string;
  entrada: number;
  saida: number;
}

export const useAreaChartData = (range: RangeType = "90d") => {
  const trpc = useTRPC();
  const { data: response, isLoading } = useQuery(
    trpc.dashboard.areaChartData.queryOptions(
      { range },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  // Garante tipagem e nunca undefined
  return {
    data: response as AreaChartDataItem[],
    isLoading,
  };
};
