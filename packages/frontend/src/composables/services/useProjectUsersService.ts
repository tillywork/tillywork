import { useHttp } from '@/composables/useHttp';
import { useQuery } from '@tanstack/vue-query';
import type { ProjectUser } from '@/components/common/projects/types';

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

  function useProjectUsersQuery({ projectId }: { projectId: number }) {
    return useQuery({
      queryKey: ['users', { projectId: projectId }],
      queryFn: () => getProjectUsers({ projectId }),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    });
  }

  return {
    useProjectUsersQuery,
  };
};
