import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { Notification } from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export const useNotificationService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  function getNotifications({
    workspaceId,
  }: {
    workspaceId: MaybeRef<number>;
  }): Promise<Notification[]> {
    return sendRequest('/notifications', {
      params: {
        workspaceId: toValue(workspaceId),
      },
    });
  }

  function useGetNotifications({
    workspaceId,
  }: {
    workspaceId: MaybeRef<number>;
  }) {
    return useQuery({
      queryKey: ['notifications', { workspaceId }],
      queryFn: () => getNotifications({ workspaceId }),
    });
  }

  function updateNotification(
    data: Partial<Notification>
  ): Promise<Notification> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return sendRequest(`/notifications/${data.id!}`, {
      method: 'PUT',
      data,
    });
  }

  function useUpdateNotification() {
    return useMutation({
      mutationFn: updateNotification,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });
  }

  return {
    useGetNotifications,
    useUpdateNotification,
  };
};
