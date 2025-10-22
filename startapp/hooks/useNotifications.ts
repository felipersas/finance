import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Notification } from '../types/notification';
import { ApiResponse } from '../types/api-response';
import { requestHandler } from '@/utils/functions/request-handler';

// Mark a notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return requestHandler(api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`));
    },
    // Optimistic update
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<ApiResponse<Notification[]>>(['notifications']);

      // Optimistically update to mark as read
      queryClient.setQueryData<ApiResponse<Notification[]>>(['notifications'], old => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
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

// Fetch all alerts/reminders
export function useNotifications() {
  return useQuery<ApiResponse<Notification[]>>({
    queryKey: ['notifications'],
    queryFn: async () => {
      return requestHandler(api.get<ApiResponse<Notification[]>>('/notifications'));
    },
  });
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
