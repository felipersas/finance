import { api } from '@/services/api';
import { ApiResponse } from '@/types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';
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

