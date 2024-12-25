import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useHttp } from '@/composables/useHttp';
import {
  ActivityType,
  type ActivityContent,
  type CardActivity,
  type SortOption,
} from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export type FindAllParams = {
  cardId?: MaybeRef<number>;
  workspaceId?: MaybeRef<number>;
  type?: MaybeRef<ActivityType>;
  sortBy?: MaybeRef<SortOption>;
};

export type FindTasksParams = FindAllParams & {
  assignee?: MaybeRef<number[]>;
  dueDate?: MaybeRef<string[] | undefined>;
};

export const useCardActivitiesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  function findAll({
    cardId,
    workspaceId,
    type,
    sortBy,
  }: FindAllParams): Promise<CardActivity[]> {
    return sendRequest(`/cards/activities`, {
      method: 'GET',
      params: {
        cardId: toValue(cardId),
        workspaceId: toValue(workspaceId),
        type: toValue(type),
        sortBy: toValue(sortBy)?.key,
        sortOrder: toValue(sortBy)?.order,
      },
    });
  }

  function useFindAllQuery({
    cardId,
    workspaceId,
    type,
    sortBy,
  }: FindAllParams) {
    return useQuery({
      queryKey: [
        'cardActivities',
        {
          cardId,
          workspaceId,
          type,
          sortBy,
        },
      ],
      queryFn: () => findAll({ cardId, workspaceId, type, sortBy }),
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
    return sendRequest(`/cards/activities`, {
      method: 'POST',
      data: {
        card: cardId,
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

  function deleteActivity({ activityId }: { activityId: number }) {
    return sendRequest(`/cards/activities/${activityId}`, {
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

  function updateActivity({ activity }: { activity: Partial<CardActivity> }) {
    return sendRequest(`/cards/activities/${activity.id}`, {
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

  function findAllTasks({
    cardId,
    workspaceId,
    assignee,
    dueDate,
    sortBy,
  }: FindTasksParams): Promise<CardActivity[]> {
    const dueDateValues = toValue(dueDate);
    const dueDateStart = dueDateValues ? dueDateValues[0] : undefined;
    const dueDateEnd = dueDateValues ? dueDateValues[1] : undefined;
    console.log('dueDateStart', dueDateStart);
    return sendRequest(`/cards/activities`, {
      method: 'GET',
      params: {
        cardId: toValue(cardId),
        workspaceId: toValue(workspaceId),
        type: ActivityType.TASK,
        assignee: toValue(assignee)?.join(','),
        sortBy: toValue(sortBy)?.key,
        sortOrder: toValue(sortBy)?.order,
        dueDateStart,
        dueDateEnd,
      },
    });
  }

  function useFindAllTasksQuery({
    cardId,
    workspaceId,
    assignee,
    dueDate,
    sortBy,
  }: FindTasksParams) {
    return useQuery({
      queryKey: [
        'cardActivities',
        {
          cardId,
          workspaceId,
          assignee,
          dueDate,
          sortBy,
        },
      ],
      queryFn: () =>
        findAllTasks({ cardId, workspaceId, assignee, dueDate, sortBy }),
    });
  }

  return {
    useFindAllQuery,
    useCreateActivityMutation,
    useDeleteActivityMutation,
    useUpdateActivityMutation,
    useFindAllTasksQuery,
  };
};
