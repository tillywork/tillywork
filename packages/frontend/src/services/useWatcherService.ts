import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { WatchableResourceType, Watcher } from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export type GetWatchersParams = {
  resourceId: MaybeRef<number>;
  resourceType: MaybeRef<WatchableResourceType>;
  enabled?: MaybeRef<boolean>;
};

export const useWatcherService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  function getWatchers({
    resourceId,
    resourceType,
  }: GetWatchersParams): Promise<Watcher[]> {
    return sendRequest('/watchers', {
      params: {
        resourceId: toValue(resourceId),
        resourceType: toValue(resourceType),
      },
    });
  }

  function useGetWatchers({
    resourceId,
    resourceType,
    enabled,
  }: GetWatchersParams) {
    return useQuery({
      queryKey: ['watchers', { resourceId, resourceType }],
      queryFn: () => getWatchers({ resourceId, resourceType }),
      enabled,
    });
  }

  function createWatcher({
    resourceId,
    resourceType,
  }: GetWatchersParams): Promise<Watcher> {
    return sendRequest('/watchers', {
      method: 'POST',
      data: {
        resourceId: toValue(resourceId),
        resourceType: toValue(resourceType),
      },
    });
  }

  function useCreateWatcher() {
    return useMutation({
      mutationFn: createWatcher,
      onSuccess: (result, variables) => {
        queryClient.invalidateQueries({ queryKey: ['watchers', variables] });
        queryClient.invalidateQueries({ queryKey: ['isWatching', variables] });
      },
    });
  }

  function getIsWatching({
    resourceId,
    resourceType,
  }: GetWatchersParams): Promise<{ watching: boolean }> {
    return sendRequest('/watchers/is-watching', {
      params: {
        resourceId: toValue(resourceId),
        resourceType: toValue(resourceType),
      },
    });
  }

  function useGetIsWatching({
    resourceId,
    resourceType,
    enabled,
  }: GetWatchersParams) {
    return useQuery({
      queryKey: ['isWatching', { resourceId, resourceType }],
      queryFn: () => getIsWatching({ resourceId, resourceType }),
      enabled,
    });
  }

  function removeWatcher({
    resourceId,
    resourceType,
  }: GetWatchersParams): Promise<{ success: boolean }> {
    return sendRequest('/watchers', {
      method: 'DELETE',
      data: {
        resourceId: toValue(resourceId),
        resourceType: toValue(resourceType),
      },
    });
  }

  function useRemoveWatcher() {
    return useMutation({
      mutationFn: removeWatcher,
      onSuccess: (result, variables) => {
        queryClient.invalidateQueries({ queryKey: ['watchers', variables] });
        queryClient.invalidateQueries({ queryKey: ['isWatching', variables] });
      },
    });
  }

  return {
    useGetWatchers,
    useCreateWatcher,
    useGetIsWatching,
    useRemoveWatcher,
  };
};
