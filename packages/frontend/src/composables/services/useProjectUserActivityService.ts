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
  const { workspace, project, user } = useAuthStore();

  async function getProjectUserActivities({
    params,
  }: {
    params?: unknown; // AxiosRequestConfig<any>.params;
  }): Promise<
    (ProjectUserActivity & { entity?: ProjectUserActivityEntity })[]
  > {
    if (project && user && workspace) {
      return sendRequest(
        `/projects/${project.id}/users/${user.id}/activities`,
        {
          method: 'GET',
          params: { workspaceId: workspace.id, ...(params ?? {}) },
        }
      );
    }

    return [];
  }

  async function getProjectUserActivitiesRecent({
    params,
  }: {
    params?: unknown;
  }): Promise<RecentActivity[]> {
    if (project && user && workspace) {
      return sendRequest(
        `/projects/${project.id}/users/${user.id}/activities/recent`,
        {
          method: 'GET',
          params: { workspaceId: workspace.id, ...(params ?? {}) },
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
    if (project && user && workspace) {
      return sendRequest(
        `/projects/${project.id}/users/${user.id}/activities`,
        {
          method: 'POST',
          data: { workspaceId: workspace.id, ...activity },
        }
      );
    }
    return undefined;
  }

  function useGetProjectUserActivitiesQuery({ params }: { params?: unknown }) {
    return useQuery({
      queryKey: [
        'projectUserActivity',
        {
          projectId: project?.id,
          userId: user?.id,
          workspaceId: workspace?.id,
        },
      ],
      queryFn: () => getProjectUserActivities({ params }),
    });
  }

  function useGetProjectUserActivitiesRecentQuery({
    params,
  }: {
    params?: unknown;
  }) {
    return useQuery({
      queryKey: [
        'projectUserActivity',
        {
          isRecent: true,
          projectId: project?.id,
          userId: user?.id,
          workspaceId: workspace?.id,
        },
      ],
      queryFn: () => getProjectUserActivitiesRecent({ params }),
    });
  }

  function useCreateProjectUserActivityMutation() {
    return useMutation({
      mutationFn: createProjectUserActivity,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            'projectUserActivity',
            {
              projectId: project?.id,
              userId: user?.id,
              workspaceId: workspace?.id,
            },
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'projectUserActivity',
            {
              isRecent: true,
              projectId: project?.id,
              userId: user?.id,
              workspaceId: workspace?.id,
            },
          ],
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
