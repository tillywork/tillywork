import { io, Socket } from 'socket.io-client';
import type { Notification } from '@tillywork/shared';
import { useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';

let socket: Socket | null = null;

export const useNotificationSocket = () => {
  const connected = ref(false);
  const queryClient = useQueryClient();
  const { workspace } = storeToRefs(useAuthStore());

  function connect(token: string) {
    console.log('socket', socket);
    console.log('token', token);
    console.log('url', import.meta.env.TW_VITE_WS_URL);
    if (socket) return; // already connected

    socket = io(import.meta.env.TW_VITE_WS_URL, {
      auth: { token },
    });

    socket.on('connect', () => {
      connected.value = true;
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      connected.value = false;
      console.log('WebSocket disconnected');
    });

    socket.on('notification', (notification: Notification) => {
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

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    disconnect,
    connected,
  };
};
