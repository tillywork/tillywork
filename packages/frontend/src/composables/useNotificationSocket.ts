import { useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from './useSocket';
import type { Notification } from '@tillywork/shared';

const listenersInitialized = ref(false);

export const useNotificationSocket = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const { workspace } = storeToRefs(authStore);

  const { socket, addEventListener } = useSocket();

  /**
   * Retrieve current notifications from the query cache
   */
  function getNotificationsFromCache(workspaceId: number): Notification[] {
    return queryClient.getQueryData(['notifications', { workspaceId }]) ?? [];
  }

  /**
   * Set notifications in the query cache
   */
  function setNotificationsInCache(
    workspaceId: number,
    notifications: Notification[]
  ) {
    queryClient.setQueryData(['notifications', { workspaceId }], notifications);
  }

  /**
   * Handle a new notification
   */
  function handleNotification(notification: Notification) {
    try {
      if (!notification?.workspace?.id) {
        console.error(
          'Received notification without workspace ID',
          notification
        );
        return;
      }

      const workspaceId = notification.workspace.id;

      const oldNotifications = getNotificationsFromCache(workspaceId);
      setNotificationsInCache(workspaceId, [notification, ...oldNotifications]);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }

  /**
   * Initialize notification listeners
   */
  function createListeners() {
    // Skip if already initialized or no socket
    if (listenersInitialized.value) {
      console.log('Notification listeners already initialized');
      return;
    }

    if (!socket.value) {
      console.warn(
        'Cannot create notification listeners - socket not connected'
      );
      return;
    }

    if (!workspace.value?.id) {
      console.warn(
        'Cannot create notification listeners - no workspace selected'
      );
      return;
    }

    // Add event listener using the socket service method
    addEventListener('notification', handleNotification);

    listenersInitialized.value = true;
    console.log('Notification listeners initialized');
  }

  /**
   * Clear notification listeners
   */
  function clearListeners() {
    if (socket.value) {
      socket.value.off('notification');
      listenersInitialized.value = false;
      console.log('Notification listeners cleared');
    }
  }

  return {
    createListeners,
    clearListeners,
    listenersInitialized,
  };
};
