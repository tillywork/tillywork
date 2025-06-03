import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { ProjectUser } from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export const useProjectUsersService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getProjectUsers({
    projectId,
  }: {
    projectId: number;
  }): Promise<ProjectUser[]> {
    return sendRequest(`/projects/${projectId}/users`, {
      method: 'GET',
    });
  }

  function useProjectUsersQuery({
    projectId,
    select,
    enabled,
  }: {
    projectId: number;
    select?: (data: ProjectUser[]) => any[];
    enabled?: MaybeRef<boolean>;
  }) {
    return useQuery({
      queryKey: ['users', { projectId: projectId }],
      queryFn: () => getProjectUsers({ projectId }),
      staleTime: 5 * 60 * 1000,
      select,
      enabled,
    });
  }

  async function deleteProjectUser({
    projectId,
    projectUserId,
  }: {
    projectId: number;
    projectUserId: number;
  }): Promise<void> {
    return sendRequest(`/projects/${projectId}/users/${projectUserId}`, {
      method: 'DELETE',
    });
  }

  function useDeleteProjectUser() {
    return useMutation({
      mutationFn: deleteProjectUser,
      onSuccess: (_, params) => {
        return queryClient.invalidateQueries({
          queryKey: ['users', { projectId: params.projectId }],
        });
      },
    });
  }

  return {
    useProjectUsersQuery,
    getProjectUsers,
    useDeleteProjectUser,
  };
};
