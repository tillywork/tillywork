import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useHttp } from '../useHttp';
import type {
  ActivityContent,
  ActivityType,
  CardActivity,
} from '@/components/project-management/cards/types';

export const useCardActivitiesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  function findAll({ cardId }: { cardId: number }): Promise<CardActivity[]> {
    return sendRequest(`/cards/${cardId}/activities`, {
      method: 'GET',
    });
  }

  function useFindAllQuery(cardId: number) {
    return useQuery({
      queryKey: [
        'cardActivities',
        {
          cardId,
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

  function useCreateActivityMutation({ cardId }: { cardId: number }) {
    return useMutation({
      mutationFn: create,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ['cardActivities', { cardId }],
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

  function useDeleteActivityMutation({ cardId }: { cardId: number }) {
    return useMutation({
      mutationFn: deleteActivity,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ['cardActivities', { cardId }],
        }),
    });
  }

  return {
    useFindAllQuery,
    useCreateActivityMutation,
    useDeleteActivityMutation,
  };
};
