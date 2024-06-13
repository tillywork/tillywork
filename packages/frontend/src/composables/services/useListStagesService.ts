import { useHttp } from '@/composables/useHttp';
import type { ListStage } from '../../components/project-management/lists/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

export const useListStagesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getListStages(
    listStage: Pick<ListStage, 'listId'>
  ): Promise<ListStage[]> {
    return sendRequest(`/lists/${listStage.listId}/stages`, {
      method: 'GET',
    });
  }

  async function createListStage({
    listId,
    listStage,
  }: {
    listId: number;
    listStage: Omit<ListStage, 'id' | 'listId'>;
  }): Promise<ListStage> {
    return sendRequest(`/lists/${listId}/stages`, {
      method: 'POST',
      data: listStage,
    });
  }

  async function getListStage(
    listStage: Pick<ListStage, 'id' | 'listId'>
  ): Promise<ListStage> {
    return sendRequest(`/lists/${listStage.listId}/stages/${listStage.id}`, {
      method: 'GET',
    });
  }

  async function updateListStage({
    listId,
    listStage,
  }: {
    listId: number;
    listStage: Partial<ListStage>;
  }): Promise<ListStage> {
    return sendRequest(`/lists/${listId}/stages/${listStage.id}`, {
      method: 'PUT',
      data: listStage,
    });
  }

  async function deleteListStage(
    listStage: Pick<ListStage, 'id' | 'listId'>
  ): Promise<void> {
    return sendRequest(`/lists/${listStage.listId}/stages/${listStage.id}`, {
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

  function useGetListStageQuery(listId: number, id: Ref<number>) {
    return useQuery({
      queryKey: ['listStage', id],
      queryFn: () => getListStage({ listId, id: unref(id) }),
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
      onSuccess: (updatedListStage) => {
        queryClient.invalidateQueries({
          queryKey: ['listStage', updatedListStage.id],
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
