import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useHttp } from '@/composables/useHttp';
import type {
  ActivityContent,
  ActivityType,
  CardActivity,
} from '@/components/project-management/cards/types';
import type { MaybeRef } from 'vue';

export const useCardActivitiesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  function findAll({
    cardId,
  }: {
    cardId: MaybeRef<number>;
  }): Promise<CardActivity[]> {
    return sendRequest(`/cards/${toValue(cardId)}/activities`, {
      method: 'GET',
    });
  }

  function useFindAllQuery(cardId: MaybeRef<number>) {
    return useQuery({
      queryKey: [
        'cardActivities',
        {
          cardId: toValue(cardId),
        },
      ],
      queryFn: () => findAll({ cardId }),
    });
  }

  function create({
    cardId,
    type,
    content,
  }: {
    cardId: number;
    type: ActivityType;
    content: ActivityContent;
  }): Promise<CardActivity> {
    return sendRequest(`/cards/${cardId}/activities`, {
      method: 'POST',
      data: {
        type,
        content,
      },
    });
  }

  function useCreateActivityMutation() {
    return useMutation({
      mutationFn: create,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ['cardActivities'],
        }),
    });
  }

  function deleteActivity({
    cardId,
    activityId,
  }: {
    cardId: number;
    activityId: number;
  }) {
    return sendRequest(`/cards/${cardId}/activities/${activityId}`, {
      method: 'DELETE',
    });
  }

  function useDeleteActivityMutation() {
    return useMutation({
      mutationFn: deleteActivity,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ['cardActivities'],
        }),
    });
  }

  return {
    useFindAllQuery,
    useCreateActivityMutation,
    useDeleteActivityMutation,
  };
};
