import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type {
  CreateProjectUserActivityDTO,
  ProjectUserActivity,
  ProjectUserActivityEntity,
} from '@/components/common/projects/types';
import { useAuthStore } from '@/stores/auth';

export type RecentActivity = {
  title: string;
  path: string;
  type: string;
};

export const useProjectUserActivityService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  const { workspace, project, user } = storeToRefs(useAuthStore());
  function extractAuth() {
    const projectId = toValue(project)?.id;
    const userId = toValue(user)?.id;
    const workspaceId = toValue(workspace)?.id;

    return { projectId, userId, workspaceId };
  }

  async function getProjectUserActivities(): Promise<
    (ProjectUserActivity & { entity?: ProjectUserActivityEntity })[]
  > {
    const { projectId, userId, workspaceId } = extractAuth();

    if (projectId && userId && workspaceId) {
      return sendRequest(`/projects/${projectId}/users/${userId}/activities`, {
        method: 'GET',
        params: { workspaceId: workspaceId },
      });
    }
    return [];
  }

  async function getProjectUserActivitiesRecent({
    limit,
  }: {
    limit?: number;
  }): Promise<RecentActivity[]> {
    const { projectId, userId, workspaceId } = extractAuth();

    if (projectId && userId && workspaceId) {
      return sendRequest(
        `/projects/${projectId}/users/${userId}/activities/recent`,
        {
          method: 'GET',
          params: { workspaceId: workspaceId, limit },
        }
      );
    }

    return [];
  }

  async function createProjectUserActivity({
    activity,
  }: {
    activity: CreateProjectUserActivityDTO;
  }): Promise<ProjectUserActivity | undefined> {
    const { projectId, userId, workspaceId } = extractAuth();

    if (projectId && userId && workspaceId) {
      return sendRequest(`/projects/${projectId}/users/${userId}/activities`, {
        method: 'POST',
        data: { workspaceId: workspaceId, ...activity },
      });
    }

    return undefined;
  }

  function useGetProjectUserActivitiesQuery() {
    const { projectId, userId, workspaceId } = extractAuth();

    return useQuery({
      queryKey: ['projectUserActivity', { projectId, userId, workspaceId }],
      queryFn: () => getProjectUserActivities(),
    });
  }

  function useGetProjectUserActivitiesRecentQuery({
    limit,
  }: {
    limit?: number;
  }) {
    const { projectId, userId, workspaceId } = extractAuth();

    return useQuery({
      queryKey: [
        'projectUserActivity',
        { isRecent: true, projectId, userId, workspaceId },
      ],
      queryFn: () => getProjectUserActivitiesRecent({ limit }),
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
    useGetProjectUserActivitiesQuery,
    useGetProjectUserActivitiesRecentQuery,
    useCreateProjectUserActivityMutation,
  };
};
