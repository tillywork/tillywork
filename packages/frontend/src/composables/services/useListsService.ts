import { useHttp } from '@/composables/useHttp';
import type { List } from '../../components/project-management/lists/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

export interface ListsData {
  lists: List[];
  total: number;
}

export const useListsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getLists({
    workspaceId,
  }: {
    workspaceId?: number;
  }): Promise<List[]> {
    return sendRequest('/lists', {
      method: 'GET',
      params: {
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

  async function getList(id: number): Promise<List> {
    return sendRequest(`/lists/${id}`, {
      method: 'GET',
    });
  }

  async function updateList(list: List): Promise<List> {
    return sendRequest(`/lists/${list.id}`, {
      method: 'PUT',
      data: list,
    });
  }

  async function deleteList(id: number): Promise<void> {
    return sendRequest(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  function useGetListsQuery(workspaceId?: number) {
    return useQuery({
      queryKey: ['lists', workspaceId],
      queryFn: () => getLists({ workspaceId }),
    });
  }

  function useGetListQuery(id: number) {
    return useQuery({
      queryKey: ['list', id],
      queryFn: () => getList(id),
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
    getLists,
    getList,
    createList,
    updateList,
    deleteList,
    useGetListsQuery,
    useGetListQuery,
    useCreateListMutation,
    useUpdateListMutation,
    useDeleteListMutation,
  };
};
