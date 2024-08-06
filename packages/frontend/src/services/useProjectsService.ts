import { useHttp } from '@/composables/useHttp';
import { useQuery } from '@tanstack/vue-query';
import type { Project } from '@/components/common/projects/types';
import type { MaybeRef } from 'vue';

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

  async function getProject({
    projectId,
  }: {
    projectId: MaybeRef<number>;
  }): Promise<Project> {
    return sendRequest(`/projects/${toValue(projectId)}`);
  }

  function useGetProject({ projectId }: { projectId: MaybeRef<number> }) {
    return useQuery({
      queryKey: ['projects', toValue(projectId)],
      queryFn: () => getProject({ projectId }),
    });
  }

  function getProjectByInviteCode({
    inviteCode,
  }: {
    inviteCode: MaybeRef<string>;
  }): Promise<Project> {
    return sendRequest(`/projects/invite/${toValue(inviteCode)}`);
  }

  function useGetProjectByInviteCode({
    inviteCode,
  }: {
    inviteCode: MaybeRef<string>;
  }) {
    return useQuery({
      queryKey: [
        'projects',
        {
          inviteCode: toValue(inviteCode),
        },
      ],
      queryFn: () => getProjectByInviteCode({ inviteCode }),
    });
  }

  return {
    useGetProjectsQuery,
    useGetProject,
    useGetProjectByInviteCode,
  };
};
