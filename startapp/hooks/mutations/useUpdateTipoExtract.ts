import { api } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';

interface UpdateTipoParams {
  id: string;
  tipo: 'Pessoal' | 'Empresa';
}

export function useUpdateTipoExtract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tipo }: UpdateTipoParams) => {
      const tipoApi = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      return requestHandler(
        api.patch<ApiResponse<null>>(`/extracts/${id}/tipo`, { tipo: tipoApi })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-extracts'], exact: false });
    },
  });
}
