import { useHttp } from '@/composables/useHttp';
import type {
  Workspace,
  WorkspaceTypes,
} from '../../modules/project-management/workspaces/types';

export interface WorkspacesData {
  workspaces: Workspace[];
  total: number;
}

export const useWorkspacesService = () => {
  async function getWorkspaces({
    workspaceType,
  }: {
    workspaceType?: WorkspaceTypes;
  }): Promise<WorkspacesData> {
    const { sendRequest } = useHttp();

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
    const { sendRequest } = useHttp();

    return sendRequest('/workspaces', {
      method: 'POST',
      data: workspace,
    });
  }

  async function getWorkspace(workspaceId: number): Promise<Workspace> {
    const { sendRequest } = useHttp();

    return sendRequest(`/workspaces/${workspaceId}`, {
      method: 'GET',
    });
  }

  async function updateWorkspace(workspace: Workspace): Promise<Workspace> {
    const { sendRequest } = useHttp();

    return sendRequest(`/workspaces/${workspace.id}`, {
      method: 'PUT',
      data: workspace,
    });
  }

  async function deleteWorkspace(workspaceId: number): Promise<void> {
    const { sendRequest } = useHttp();

    return sendRequest(`/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });
  }

  return {
    getWorkspaces,
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
};
