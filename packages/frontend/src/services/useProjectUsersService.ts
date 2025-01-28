import { useHttp } from '@/composables/useHttp';
import { useQuery } from '@tanstack/vue-query';
import type { ProjectUser } from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export const useProjectUsersService = () => {
  const { sendRequest } = useHttp();

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

  return {
    useProjectUsersQuery,
    getProjectUsers,
  };
};
