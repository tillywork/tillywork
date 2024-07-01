import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useHttp } from '../useHttp';
import type {
  CardType,
  CreateCardTypeDto,
} from '@/components/project-management/cards/types';
import { useWorkspaceStore } from '@/stores/workspace';
import type { MaybeRef } from 'vue';

export const useCardTypesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = storeToRefs(useWorkspaceStore());

  function findAll({
    workspaceId,
  }: {
    workspaceId: number;
  }): Promise<CardType[]> {
    return sendRequest(`/card-types`, {
      method: 'GET',
      params: {
        workspaceId,
      },
    });
  }

  function useFindAllQuery({
    workspaceId,
    enabled,
  }: {
    workspaceId: number;
    enabled?: MaybeRef<boolean>;
  }) {
    return useQuery({
      queryKey: [
        'cardTypes',
        {
          workspaceId,
        },
      ],
      queryFn: () => findAll({ workspaceId }),
      enabled,
    });
  }

  function create(cardTypeDto: CreateCardTypeDto) {
    return sendRequest('/card-types', {
      method: 'POST',
      data: cardTypeDto,
    });
  }

  function useCreateMutation() {
    return useMutation({
      mutationFn: create,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            'cardTypes',
            {
              workspaceId: selectedWorkspace.value?.id,
            },
          ],
        });
        queryClient.invalidateQueries({
          queryKey: ['workspaces'],
        });
      },
    });
  }

  function remove({
    id,
    replacementCardType,
  }: {
    id: number;
    replacementCardType: CardType;
  }) {
    return sendRequest(`/card-types/${id}`, {
      method: 'DELETE',
      data: replacementCardType,
    });
  }

  function useRemoveMutation() {
    return useMutation({
      mutationFn: remove,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            'cardTypes',
            {
              workspaceId: selectedWorkspace.value?.id,
            },
          ],
        });
        queryClient.invalidateQueries({
          queryKey: ['workspaces'],
        });
      },
    });
  }

  return {
    useFindAllQuery,
    useCreateMutation,
    useRemoveMutation,
  };
};
