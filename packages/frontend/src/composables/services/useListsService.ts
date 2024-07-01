import { useHttp } from '@/composables/useHttp';
import type { List } from '../../components/project-management/lists/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRef } from 'vue';

export const useListsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getLists({
    spaceId,
    workspaceId,
  }: {
    spaceId?: number;
    workspaceId?: number;
  }): Promise<List[]> {
    return sendRequest('/lists', {
      method: 'GET',
      params: {
        spaceId,
        workspaceId,
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
  }: {
    spaceId?: number;
    workspaceId?: number;
  }) {
    return useQuery({
      queryKey: [
        'lists',
        {
          spaceId,
          workspaceId,
        },
      ],
      queryFn: () => getLists({ spaceId, workspaceId }),
      staleTime: 1 * 60 * 1000,
    });
  }

  function useGetListQuery(id: MaybeRef<number>) {
    return useQuery({
      queryKey: ['lists', toValue(id)],
      queryFn: () => getList(toValue(id)),
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
    useGetListsQuery,
    useGetListQuery,
    useCreateListMutation,
    useUpdateListMutation,
    useDeleteListMutation,
  };
};
