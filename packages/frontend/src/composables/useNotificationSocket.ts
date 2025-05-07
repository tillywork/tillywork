import type { Notification } from '@tillywork/shared';
import { useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from './useSocket';

export const useNotificationSocket = () => {
  const queryClient = useQueryClient();
  const { workspace } = storeToRefs(useAuthStore());
  const { socket } = useSocket();

  watchEffect(() => {
    if (socket.value) {
      socket.value.on('notification', (notification: Notification) => {
        const oldNotifications: Notification[] =
          queryClient.getQueryData([
            'notifications',
            { workspaceId: Number(workspace.value?.id) },
          ]) ?? [];

        queryClient.setQueryData(
          ['notifications', { workspaceId: Number(workspace.value?.id) }],
          [notification, ...oldNotifications]
        );
      });
    }
  });

  return { socket };
};
