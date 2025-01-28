import type { MaybeRef } from 'vue';
import { useHttp } from '@/composables/useHttp';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { ListStage } from '@tillywork/shared';

export const useListStagesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getListStages({
    listId,
  }: {
    listId: MaybeRef<number>;
  }): Promise<ListStage[]> {
    return sendRequest(`/lists/${listId}/stages`, {
      method: 'GET',
    });
  }

  async function createListStage({
    listId,
    listStage,
  }: {
    listId: MaybeRef<number>;
    listStage: Omit<ListStage, 'id' | 'listId'>;
  }): Promise<ListStage> {
    return sendRequest(`/lists/${toValue(listId)}/stages`, {
      method: 'POST',
      data: listStage,
    });
  }

  async function getListStage({
    listId,
    id,
  }: {
    listId: MaybeRef<number>;
    id: MaybeRef<number>;
  }): Promise<ListStage> {
    return sendRequest(`/lists/${toValue(listId)}/stages/${id}`, {
      method: 'GET',
    });
  }

  async function updateListStage({
    listId,
    listStage,
  }: {
    listId: MaybeRef<number>;
    listStage: Partial<Omit<ListStage, 'listId'>>;
  }): Promise<ListStage> {
    return sendRequest(`/lists/${toValue(listId)}/stages/${listStage.id}`, {
      method: 'PUT',
      data: listStage,
    });
  }

  async function reorderListStage({
    listId,
    listStages,
  }: {
    listId: MaybeRef<number>;
    listStages: Pick<ListStage, 'id' | 'order'>[];
  }): Promise<ListStage> {
    return sendRequest(`/lists/${toValue(listId)}/stages/reorder`, {
      method: 'PUT',
      data: listStages,
    });
  }

  async function deleteListStage({
    listStage,
    replacementListStage,
  }: {
    listStage: Pick<ListStage, 'id' | 'listId'>;
    replacementListStage: ListStage;
  }): Promise<void> {
    return sendRequest(`/lists/${listStage.listId}/stages/${listStage.id}`, {
      method: 'DELETE',
      data: replacementListStage,
    });
  }

  function useGetListStagesQuery({
    listId,
    enabled,
  }: {
    listId: MaybeRef<number>;
    enabled?: Ref<boolean>;
  }) {
    return useQuery({
      queryKey: ['listStages', listId],
      queryFn: () => getListStages({ listId: toValue(listId) }),
      enabled,
      staleTime: 5 * 60 * 1000,
    });
  }

  function useGetListStageQuery({
    listId,
    id,
  }: {
    listId: MaybeRef<number>;
    id: MaybeRef<number>;
  }) {
    return useQuery({
      queryKey: ['listStage', id],
      queryFn: () => getListStage({ listId: toValue(listId), id: toValue(id) }),
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

  function useReorderListStageMutation() {
    return useMutation({
      mutationFn: reorderListStage,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listStages'] });
        queryClient.invalidateQueries({ queryKey: ['listGroups'] });
      },
    });
  }

  return {
    useGetListStagesQuery,
    useGetListStageQuery,
    useCreateListStageMutation,
    useUpdateListStageMutation,
    useDeleteListStageMutation,
    useReorderListStageMutation,
  };
};
