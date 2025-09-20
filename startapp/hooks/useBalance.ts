import { api } from "@/services/api"
import { ApiResponse } from "@/types/api-response"

import { useQuery } from "@tanstack/react-query"

export interface Analytics {
  balance: number;
  spentPerDay: {
    date: string;
    total: number;
  }
}


export const useGetAnalytics = () => {
  const {
    data: response,
    isLoading,
    error,
    isFetching
  } = useQuery<ApiResponse<Analytics>>(
    {
      staleTime: 1000 * 60 * 5,
      queryKey: ["analytics"],
      queryFn: () => getAnalytics(),
      refetchInterval: 45000
    }
  )

  return { response, isLoading, error, isFetching }
}

async function getAnalytics(): Promise<ApiResponse<Analytics>> {
  const res = await api.get<ApiResponse<Analytics>>("/analytics")

  return res.data
}