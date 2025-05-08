import type { Notification } from '@tillywork/shared';
import { useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from './useSocket';

export const useNotificationSocket = () => {
  const queryClient = useQueryClient();
  const { workspace } = storeToRefs(useAuthStore());
  const { socket } = useSocket();

  function createListeners() {
    if (socket.value && workspace.value) {
      socket.value.on('notification', (notification: Notification) => {
        const oldNotifications: Notification[] =
          queryClient.getQueryData([
            'notifications',
            { workspaceId: notification.workspace.id },
          ]) ?? [];

        queryClient.setQueryData(
          ['notifications', { workspaceId: notification.workspace.id }],
          [notification, ...oldNotifications]
        );
      });
    }
  }

  return { createListeners };
};
