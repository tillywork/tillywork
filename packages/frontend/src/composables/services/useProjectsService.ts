import { useHttp } from '@/composables/useHttp';
import { useQuery } from '@tanstack/vue-query';
import type { Project } from '@/components/common/projects/types';

export const useProjectsService = () => {
  const { sendRequest } = useHttp();

  async function getProjects(): Promise<Project[]> {
    return sendRequest('/projects', {
      method: 'GET',
    });
  }

  function useGetProjectsQuery({ enabled }: { enabled?: Ref<boolean> }) {
    return useQuery({
      queryKey: ['projects'],
      queryFn: getProjects,
      enabled,
    });
  }

  return {
    useGetProjectsQuery,
  };
};
