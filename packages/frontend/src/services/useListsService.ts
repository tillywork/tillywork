import { useHttp } from '@/composables/useHttp';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { List } from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export const useListsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getLists({
    spaceId,
    workspaceId,
    throughSpace,
  }: {
    spaceId?: MaybeRef<number>;
    workspaceId?: MaybeRef<number>;
    throughSpace?: MaybeRef<boolean>;
  }): Promise<List[]> {
    return sendRequest('/lists', {
      method: 'GET',
      params: {
        spaceId: toValue(spaceId),
        workspaceId: toValue(workspaceId),
        throughSpace: toValue(throughSpace),
      },
    });
  }

  async function createList(list: Partial<List>): Promise<List> {
    return sendRequest('/lists', {
      method: 'POST',
      data: list,
    });
  }

  async function getList(id: MaybeRef<number>): Promise<List> {
    return sendRequest(`/lists/${toValue(id)}`, {
      method: 'GET',
    });
  }

  async function updateList({
    id,
    updateDto,
  }: {
    id: number;
    updateDto: Partial<List>;
  }): Promise<List> {
    return sendRequest(`/lists/${id}`, {
      method: 'PUT',
      data: updateDto,
    });
  }

  async function deleteList(id: number): Promise<void> {
    return sendRequest(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  function useGetListsQuery({
    spaceId,
    workspaceId,
    throughSpace,
    enabled,
  }: {
    spaceId?: MaybeRef<number>;
    workspaceId?: MaybeRef<number>;
    throughSpace?: MaybeRef<boolean>;
    enabled?: Ref<boolean>;
  }) {
    return useQuery({
      queryKey: [
        'lists',
        {
          spaceId,
          workspaceId,
          throughSpace,
        },
      ],
      queryFn: () => getLists({ spaceId, workspaceId, throughSpace }),
      staleTime: 1 * 60 * 1000,
      enabled,
    });
  }

  function useGetListQuery(id: MaybeRef<number>) {
    return useQuery({
      queryKey: ['lists', id],
      queryFn: () => getList(id),
      retry: false,
      staleTime: 1 * 60 * 1000,
    });
  }

  function useCreateListMutation() {
    return useMutation({
      mutationFn: createList,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lists'] });
      },
    });
  }

  function useUpdateListMutation() {
    return useMutation({
      mutationFn: updateList,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lists'] });
      },
    });
  }

  function useDeleteListMutation() {
    return useMutation({
      mutationFn: deleteList,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lists'] });
      },
    });
  }

  return {
    getList,
    getLists,
    useGetListsQuery,
    useGetListQuery,
    useCreateListMutation,
    useUpdateListMutation,
    useDeleteListMutation,
  };
};
