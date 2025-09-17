import { api } from "@/services/api"
import { ApiResponse } from "@/types/api-response"
import { PaginatedParams } from "@/types/paginated-params"
import { PaginatedResponse } from "@/types/paginated-response"

import { useQuery } from "@tanstack/react-query"

export interface ListExtractItem {
  id: string
  valor: number
  descricao: string
  remetenteDestinatario: string
  data: string
}


export const useListExtract = (params: PaginatedParams) => {
  const { data: response, isLoading, error } = useQuery<ApiResponse<PaginatedResponse<ListExtractItem>>>({
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryKey: ["list-extracts", params.page, params.perPage, params.orderDirection],
    queryFn: () => getListExtract(params)
  })

  return { response, isLoading, error }
}

async function getListExtract(params: PaginatedParams): Promise<ApiResponse<PaginatedResponse<ListExtractItem>>> {
  const res = await api.get<ApiResponse<PaginatedResponse<ListExtractItem>>>("/extracts", {
    params
  })

  return res.data
}