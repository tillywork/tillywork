import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type {
  CreateProjectUserActivityDTO,
  ProjectUserActivity,
} from '@/components/common/projects/types';

type ProjectUserActivitiesParam = {
  projectId: number;
  userId: number;
};
type GetProjectUserActivitiesParam = ProjectUserActivitiesParam & {
  workspaceId: number;
  params?: unknown; // AxiosRequestConfig<any>.params;
};

export const useProjectUserActivityService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getProjectUserActivities({
    projectId,
    userId,
    workspaceId,
    params,
  }: GetProjectUserActivitiesParam): Promise<ProjectUserActivity[]> {
    return sendRequest(`/projects/${projectId}/users/${userId}/activities`, {
      method: 'GET',
      params: { workspaceId, ...(params ?? {}) },
    });
  }

  async function createProjectUserActivity({
    projectId,
    userId,
    activity,
  }: ProjectUserActivitiesParam & {
    activity: CreateProjectUserActivityDTO;
  }): Promise<ProjectUserActivity> {
    return sendRequest(`/projects/${projectId}/users/${userId}/activities`, {
      method: 'POST',
      data: activity,
    });
  }

  function useProjectUserActivitiesQuery({
    projectId,
    userId,
    workspaceId,
    params,
  }: GetProjectUserActivitiesParam) {
    return useQuery({
      queryKey: ['projectUserActivity', { projectId, userId, workspaceId }],
      queryFn: () =>
        getProjectUserActivities({ projectId, userId, workspaceId, params }),
    });
  }

  function useCreateProjectUserActivityMutation() {
    return useMutation({
      mutationFn: createProjectUserActivity,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['projectUserActivity'],
        });
      },
    });
  }

  return {
    useProjectUserActivitiesQuery,
    useCreateProjectUserActivityMutation,
  };
};
