import { useHttp } from '@/composables/useHttp';
import type {
  Workspace,
  WorkspaceTypes,
} from '../../components/project-management/workspaces/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

export interface WorkspacesData {
  workspaces: Workspace[];
  total: number;
}

export const useWorkspacesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getWorkspaces({
    workspaceType,
  }: {
    workspaceType?: WorkspaceTypes;
  }): Promise<WorkspacesData> {
    return sendRequest('/workspaces', {
      method: 'GET',
      params: {
        workspaceType,
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

  function useGetWorkspacesQuery(workspaceType?: WorkspaceTypes) {
    return useQuery({
      queryKey: ['workspaces', workspaceType],
      queryFn: () => getWorkspaces({ workspaceType }),
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
    getWorkspaces,
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    useGetWorkspacesQuery,
    useGetWorkspaceQuery,
    useCreateWorkspaceMutation,
    useUpdateWorkspaceMutation,
    useDeleteWorkspaceMutation,
  };
};
