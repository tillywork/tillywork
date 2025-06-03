import { useNotificationService } from '@/services/useNotificationService';
import { useAuthStore } from './auth';

export const useNotificationStore = defineStore(
  'notification',
  () => {
    const { workspace } = storeToRefs(useAuthStore());
    const { useGetNotifications } = useNotificationService();

    const { data: notifications } = useGetNotifications({
      workspaceId: computed(() => Number(workspace.value?.id)),
    });
    const unreadNotifications = computed(() => {
      return notifications.value?.filter((notification) => !notification.isRead)
        .length;
    });

    return {
      notifications,
      unreadNotifications,
    };
  },
  {
    persist: true,
  }
);
