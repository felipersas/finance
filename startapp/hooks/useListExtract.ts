import { api } from "@/services/api"
import { ApiResponse } from "@/types/api-response"
import { PaginatedParams } from "@/types/paginated-params"
import { PaginatedResponse } from "@/types/paginated-response"
import { requestHandler } from "@/utils/functions/request-handler"

import { useQuery } from "@tanstack/react-query"

export interface ListExtractItem {
  id: string
  valor: number
  descricao: string
  remetenteDestinatario: string
  data: string
  tipo: 'Pessoal' | 'Empresa';
}


export const useListExtract = (params: PaginatedParams) => {
  const {
    data: response,
    isLoading,
    error,
    isFetching
  } = useQuery<ApiResponse<PaginatedResponse<ListExtractItem>>>(
    {
  staleTime: 0,
      queryKey: ["list-extracts", params.page, params.perPage, params.orderDirection],
      queryFn: () => getListExtract(params),
      refetchInterval: 45000
    }
  )

  return { response, isLoading, error, isFetching }
}

async function getListExtract(params: PaginatedParams): Promise<ApiResponse<PaginatedResponse<ListExtractItem>>> {
  return requestHandler(
    api.get<ApiResponse<PaginatedResponse<ListExtractItem>>>("/extracts", { params })
  );
}
