import { useHttp } from '@/composables/useHttp';
import type {
  Workspace,
  WorkspaceTypes,
} from '../../components/project-management/workspaces/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRef } from 'vue';

export const useWorkspacesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getWorkspaces({
    type,
  }: {
    type?: MaybeRef<WorkspaceTypes>;
  }): Promise<Workspace[]> {
    return sendRequest('/workspaces', {
      method: 'GET',
      params: {
        type: toValue(type),
      },
    });
  }

  async function createWorkspace(
    workspace: Partial<Workspace>
  ): Promise<Workspace> {
    return sendRequest('/workspaces', {
      method: 'POST',
      data: workspace,
    });
  }

  async function getWorkspace(workspaceId: number): Promise<Workspace> {
    return sendRequest(`/workspaces/${workspaceId}`, {
      method: 'GET',
    });
  }

  async function updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return sendRequest(`/workspaces/${workspace.id}`, {
      method: 'PUT',
      data: workspace,
    });
  }

  async function deleteWorkspace(workspaceId: number): Promise<void> {
    return sendRequest(`/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });
  }

  function useGetWorkspacesQuery({
    type,
    enabled,
  }: {
    type?: MaybeRef<WorkspaceTypes>;
    enabled?: Ref<boolean>;
  }) {
    return useQuery({
      queryKey: ['workspaces', toValue(type)],
      queryFn: () => getWorkspaces({ type }),
      enabled,
    });
  }

  function useGetWorkspaceQuery(workspaceId: number) {
    return useQuery({
      queryKey: ['workspace', workspaceId],
      queryFn: () => getWorkspace(workspaceId),
    });
  }

  function useCreateWorkspaceMutation() {
    return useMutation({
      mutationFn: createWorkspace,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      },
    });
  }

  function useUpdateWorkspaceMutation() {
    return useMutation({
      mutationFn: updateWorkspace,
      onSuccess: (updatedWorkspace) => {
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        queryClient.invalidateQueries({
          queryKey: ['workspace', updatedWorkspace.id],
        });
      },
    });
  }

  function useDeleteWorkspaceMutation() {
    return useMutation({
      mutationFn: deleteWorkspace,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      },
    });
  }

  return {
    useGetWorkspacesQuery,
    useGetWorkspaceQuery,
    useCreateWorkspaceMutation,
    useUpdateWorkspaceMutation,
    useDeleteWorkspaceMutation,
  };
};
