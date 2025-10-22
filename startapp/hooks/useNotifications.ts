import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Notification } from '../types/notification';
import { ApiResponse } from '../types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';

import { PaginatedParams } from "@/types/paginated-params";
import { PaginatedResponse } from "@/types/paginated-response";

// Mark a notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return requestHandler(api.patch<ApiResponse<PaginatedResponse<Notification>>>(`/notifications/${id}/read`));
    },
    // Optimistic update
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<ApiResponse<PaginatedResponse<Notification>>>(['notifications']);

      // Optimistically update to mark as read
      queryClient.setQueryData<ApiResponse<PaginatedResponse<Notification>>>(['notifications'], old => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
          },
        };
      });

      return { previousNotifications };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export const useNotifications = (params: Partial<PaginatedParams> = {}) => {
  const { page = 1, perPage = 10, orderDirection = 'desc' } = params;
  const {
    data: response,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery<ApiResponse<PaginatedResponse<Notification>>>(
    {
      staleTime: 0,
      queryKey: ["notifications", page, perPage, orderDirection],
      queryFn: () => getNotifications({ page, perPage, orderDirection }),
      refetchInterval: 45000
    }
  )

  return { response, isLoading, error, isFetching, refetch }
}

async function getNotifications(params: PaginatedParams): Promise<ApiResponse<PaginatedResponse<Notification>>> {
  return requestHandler(
    api.get<ApiResponse<PaginatedResponse<Notification>>>("/notifications", { params })
  );
}

// Create a new alert/reminder
export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Notification, 'id' | 'read'>) => {
      return requestHandler(api.post<ApiResponse<Notification>>('/notifications', input));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Update an alert/reminder
export function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<Notification> }) => {
      return requestHandler(api.put<ApiResponse<Notification>>(`/notifications/${id}`, input));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Delete an alert/reminder
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await requestHandler(api.delete<ApiResponse<null>>(`/notifications/${id}`));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
