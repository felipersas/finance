'use client';

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc-client";

type RangeType = "7d" | "30d" | "90d";

export interface AreaChartDataItem {
  date: string;
  entrada: number;
  saida: number;
}

/**
 * Hook para buscar dados do gráfico de área (entradas/saídas por dia)
 * @param range - período ("7d", "30d", "90d")
 */
export const useAreaChartData = (range: RangeType = "90d") => {
  const trpc = useTRPC();
  const { data: response, isLoading } = useQuery(
    trpc.dashboard.areaChartData.queryOptions({ range }, {
      placeholderData: keepPreviousData
    })
  );

  // Garante tipagem e nunca undefined
  return {
    data: response as AreaChartDataItem[],
    isLoading
  };
};
