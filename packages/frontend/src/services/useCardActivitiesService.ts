import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useHttp } from '@/composables/useHttp';
import {
  ActivityType,
  assertNotNullOrUndefined,
  TaskStatus,
  type ActivityContent,
  type CardActivity,
  type SortOption,
} from '@tillywork/shared';
import type { MaybeRef } from 'vue';
import { useAuthStore } from '@/stores/auth';

export type FindAllParams = {
  cardId?: MaybeRef<number>;
  workspaceId?: MaybeRef<number>;
  type?: MaybeRef<ActivityType>;
  sortBy?: MaybeRef<SortOption>;
};

export type FindTasksParams = FindAllParams & {
  assignee?: MaybeRef<number[]>;
  dueDate?: MaybeRef<string[] | undefined>;
  isCompleted?: MaybeRef<boolean>;
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
    isCompleted,
    sortBy,
  }: FindTasksParams): Promise<CardActivity[]> {
    const dueDateValues = toValue(dueDate);
    const dueDateStart = dueDateValues ? dueDateValues[0] : undefined;
    const dueDateEnd = dueDateValues ? dueDateValues[1] : undefined;
    const assigneeValues = toValue(assignee);

    const params: Record<string, any> = {
      cardId: toValue(cardId),
      workspaceId: toValue(workspaceId),
      type: ActivityType.TASK,
      sortBy: toValue(sortBy)?.key,
      sortOrder: toValue(sortBy)?.order,
      dueDateStart,
      dueDateEnd,
      isCompleted: toValue(isCompleted),
    };

    if (assigneeValues?.length) {
      params.assignee = assigneeValues;
    }

    return sendRequest(`/cards/activities`, {
      method: 'GET',
      params,
      paramsSerializer: {
        indexes: null,
      },
    });
  }

  function useFindAllTasksQuery({
    cardId,
    workspaceId,
    assignee,
    dueDate,
    isCompleted,
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
          isCompleted,
          sortBy,
        },
      ],
      queryFn: () =>
        findAllTasks({
          cardId,
          workspaceId,
          assignee,
          dueDate,
          isCompleted,
          sortBy,
        }),
    });
  }

  function setTaskAsCompleted(
    task: MaybeRef<CardActivity>
  ): Promise<CardActivity> {
    assertNotNullOrUndefined(toValue(task), 'Task is undefined');

    return sendRequest(`/cards/activities/${toValue(task).id}`, {
      method: 'PUT',
      data: {
        content: {
          ...toValue(task).content,
          isCompleted: true,
          status: TaskStatus.COMPLETED,
        },
      },
    });
  }

  function setTaskAsNotCompleted(
    task: MaybeRef<CardActivity>
  ): Promise<CardActivity> {
    assertNotNullOrUndefined(toValue(task), 'Task is undefined');

    return sendRequest(`/cards/activities/${toValue(task).id}`, {
      method: 'PUT',
      data: {
        content: {
          ...toValue(task).content,
          isCompleted: false,
        },
      },
    });
  }

  function useSetTaskAsCompleted() {
    return useMutation({
      mutationFn: setTaskAsCompleted,
      onSuccess: () => {
        const { workspace } = storeToRefs(useAuthStore());

        queryClient.invalidateQueries({
          queryKey: [
            'cardActivities',
            {
              workspaceId: toValue(workspace)?.id,
            },
          ],
        });
      },
    });
  }

  function useSetTaskAsNotCompleted() {
    return useMutation({
      mutationFn: setTaskAsNotCompleted,
      onSuccess: () => {
        const { workspace } = storeToRefs(useAuthStore());

        queryClient.invalidateQueries({
          queryKey: [
            'cardActivities',
            {
              workspaceId: toValue(workspace)?.id,
            },
          ],
        });
      },
    });
  }

  return {
    useFindAllQuery,
    useCreateActivityMutation,
    useDeleteActivityMutation,
    useUpdateActivityMutation,
    useFindAllTasksQuery,
    useSetTaskAsCompleted,
    useSetTaskAsNotCompleted,
  };
};
