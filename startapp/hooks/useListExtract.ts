import { api } from "@/services/api"
import { apiResponse } from "@/types/api-response"
import { useQuery } from "@tanstack/react-query"

interface ListExtractItem {
  id: string
  valor: string
  descricao: string
  remetenteDestinario: string
  createdAt: string
}


export const useListExtract = (page: number, perPage: number) => {
  const { data: response, isLoading, error } = useQuery<apiResponse<ListExtractItem[]>>({
    queryKey: ["list-extracts", page, perPage],
    queryFn: () => getListExtract(page, perPage)
  })

  return { response, isLoading, error }
}

async function getListExtract(page: number, perPage: number): Promise<apiResponse<ListExtractItem[]>> {
  const res = await api.get(`/api/extracts`, {
    params: {
      page,
      perPage
    }
  })

  return res.data
}