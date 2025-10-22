import { api } from '@/services/api';
import { ApiResponse } from '@/types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';
import { showToast } from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const uploadCsv = async (formData: FormData): Promise<ApiResponse<null>> => {
  const response = await requestHandler(
    api.post<ApiResponse<null>>(
      '/csv/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  );
  if (response.success) {
    showToast('success', 'Sucesso!', response.message);
  } else {
    showToast('error', 'Erro!', response.message || 'erro desconhecido');
  }
  return response;
};

export const useUploadCsvMutation = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadCsv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-extracts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
