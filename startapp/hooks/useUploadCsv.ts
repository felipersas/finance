import { api } from '@/services/api';
import { ApiResponse } from '@/types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';
import { showToast } from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const uploadCsv = async (formData: FormData): Promise<ApiResponse<null>> => {
  const request = api.post<ApiResponse<null>>(
    '/csv/upload',
    formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  try {
    const response = await request;
    if (response && response.data && response?.data) {
      showToast('success', 'Sucesso!', response.data.message);
    } else {
      showToast('error', 'Erro!', response?.data.message || 'erro desconhecido');
    }
  } catch (error: any) {
    showToast('error', 'Erro!', error?.response?.data?.message || 'erro desconhecido');
  }

  return requestHandler(request);
};

export const useUploadCsvMutation = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadCsv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-extracts'] });
    },
  });
};

