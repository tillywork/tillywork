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

  async function getLists({ spaceId }: { spaceId?: number }): Promise<List[]> {
    return sendRequest('/lists', {
      method: 'GET',
      params: {
        spaceId,
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

  function useGetListsQuery(spaceId?: number) {
    return useQuery({
      queryKey: [
        'lists',
        {
          spaceId,
        },
      ],
      queryFn: () => getLists({ spaceId }),
      staleTime: 1 * 60 * 1000,
    });
  }

  function useGetListQuery(id: Ref<number>) {
    return useQuery({
      queryKey: ['lists', id.value],
      queryFn: () => getList(id.value),
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
    useGetListsQuery,
    useGetListQuery,
    useCreateListMutation,
    useUpdateListMutation,
    useDeleteListMutation,
  };
};
