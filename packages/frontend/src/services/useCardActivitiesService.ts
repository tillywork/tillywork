import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useHttp } from '@/composables/useHttp';
import type {
  ActivityContent,
  ActivityType,
  CardActivity,
} from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export type FindAllParams = {
  cardId: MaybeRef<number>;
  sortBy?: {
    key: string;
    order: 'asc' | 'desc';
  };
};

export const useCardActivitiesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  function findAll({ cardId, sortBy }: FindAllParams): Promise<CardActivity[]> {
    return sendRequest(`/cards/${toValue(cardId)}/activities`, {
      method: 'GET',
      params: {
        sortBy: sortBy?.key,
        sortOrder: sortBy?.order,
      },
    });
  }

  function useFindAllQuery({ cardId, sortBy }: FindAllParams) {
    return useQuery({
      queryKey: [
        'cardActivities',
        {
          cardId: toValue(cardId),
          sortBy: `${sortBy?.key}`,
        },
      ],
      queryFn: () => findAll({ cardId, sortBy }),
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

  function updateActivity({
    cardId,
    activity,
  }: {
    cardId: number;
    activity: Partial<CardActivity>;
  }) {
    return sendRequest(`/cards/${cardId}/activities/${activity.id}`, {
      method: 'PUT',
      data: activity,
    });
  }

  function useUpdateActivityMutation() {
    return useMutation({
      mutationFn: updateActivity,
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
    useUpdateActivityMutation,
  };
};
