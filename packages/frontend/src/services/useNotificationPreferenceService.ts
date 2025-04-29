import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type {
  NotificationChannel,
  NotificationPreference,
} from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export type GetPreferenceParams = {
  channel: MaybeRef<NotificationChannel>;
};

export const useNotificationPreferenceService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  function getNotificationPreference({
    channel,
  }: GetPreferenceParams): Promise<NotificationPreference> {
    return sendRequest(`/notification-preferences/${toValue(channel)}`);
  }

  function useGetNotificationPreference({ channel }: GetPreferenceParams) {
    return useQuery({
      queryKey: ['notification-preference', channel],
      queryFn: () => getNotificationPreference({ channel }),
    });
  }

  function upsertPreference(dto: {
    channel: NotificationChannel;
    enabled: boolean;
  }): Promise<NotificationPreference> {
    return sendRequest(`/notification-preferences`, {
      method: 'POST',
      data: dto,
    });
  }

  function useUpsertPreference() {
    return useMutation({
      mutationFn: upsertPreference,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ['notification-preference', data.channel],
        });
      },
    });
  }

  return {
    useGetNotificationPreference,
    useUpsertPreference,
  };
};
