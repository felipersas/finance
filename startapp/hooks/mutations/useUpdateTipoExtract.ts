import { api } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateTipoParams {
  id: string;
  tipo: 'Pessoal' | 'Empresa';
}

export function useUpdateTipoExtract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tipo }: UpdateTipoParams) => {
      const tipoApi = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      await api.patch(`/extracts/${id}/tipo`, { tipo: tipoApi });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-extracts'], exact: false });
    },
  });
}
