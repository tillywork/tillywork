import { useHttp } from '@/composables/useHttp';
import type { ListStage } from '../../components/project-management/lists/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

export const useListStagesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getListStages({
    listId,
  }: {
    listId: number;
  }): Promise<ListStage[]> {
    return sendRequest(`/lists/${listId}/stages`, {
      method: 'GET',
    });
  }

  async function createListStage(list: Partial<ListStage>): Promise<ListStage> {
    return sendRequest('/lists', {
      method: 'POST',
      data: list,
    });
  }

  async function getListStage(id: number): Promise<ListStage> {
    return sendRequest(`/lists/${id}`, {
      method: 'GET',
    });
  }

  async function updateListStage(list: ListStage): Promise<ListStage> {
    return sendRequest(`/lists/${list.id}`, {
      method: 'PUT',
      data: list,
    });
  }

  async function deleteListStage(id: number): Promise<void> {
    return sendRequest(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  function useGetListStagesQuery(listId: number) {
    return useQuery({
      queryKey: ['listStages', listId],
      queryFn: () => getListStages({ listId }),
      staleTime: 5 * 60 * 1000,
    });
  }

  function useGetListStageQuery(id: number) {
    return useQuery({
      queryKey: ['listStage', id],
      queryFn: () => getListStage(id),
    });
  }

  function useCreateListStageMutation() {
    return useMutation({
      mutationFn: createListStage,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listStages'] });
      },
    });
  }

  function useUpdateListStageMutation() {
    return useMutation({
      mutationFn: updateListStage,
      onSuccess: (newListStage) => {
        queryClient.invalidateQueries({
          queryKey: ['listStage', newListStage.id],
        });
        queryClient.invalidateQueries({ queryKey: ['listStages'] });
      },
    });
  }

  function useDeleteListStageMutation() {
    return useMutation({
      mutationFn: deleteListStage,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listStages'] });
      },
    });
  }

  return {
    useGetListStagesQuery,
    useGetListStageQuery,
    useCreateListStageMutation,
    useUpdateListStageMutation,
    useDeleteListStageMutation,
  };
};
