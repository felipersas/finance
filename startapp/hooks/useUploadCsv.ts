import { api } from '@/services/api';
import { ApiResponse } from '@/types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadCsvRequest {
  file: FormData;
}



const uploadCsv = async (data: UploadCsvRequest): Promise<ApiResponse<null>> => {
  const request = api.post<ApiResponse<null>>(
    '/csv/upload',
    data,
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

export type { UploadCsvRequest };
