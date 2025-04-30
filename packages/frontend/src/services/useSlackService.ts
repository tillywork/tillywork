import { useHttp } from '@/composables/useHttp';
import { useQuery } from '@tanstack/vue-query';
import type { SlackChannel } from '@tillywork/shared';

export const useSlackService = () => {
  const { sendRequest } = useHttp();

  function getChannels(): Promise<SlackChannel[]> {
    return sendRequest('/slack/channels');
  }

  function useGetChannels() {
    return useQuery({
      queryKey: ['slack/channels'],
      queryFn: getChannels,
      retry: false,
    });
  }

  return {
    useGetChannels,
  };
};
