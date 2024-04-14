import { useHttp } from '@/composables/useHttp';
import type { Workspace, WorkspaceTypes } from './types';

export interface WorkspacesData {
	workspaces: Workspace[];
	total: number;
}

export class WorkspacesService {
	async getWorkspaces({
		workspaceType
	}: { workspaceType?: WorkspaceTypes }): Promise<WorkspacesData> {
		const { data, sendRequest } = useHttp();

		await sendRequest('/workspaces', {
			method: 'GET',
			params: {
				workspaceType,
			}
		});

		return data.value;
	}

	async createWorkspace(workspace: Partial<Workspace>): Promise<Workspace> {
		const { data, sendRequest } = useHttp();

		await sendRequest('/workspaces', {
			method: 'POST',
			data: workspace,
		});

		return data.value;
	}

	async getWorkspace(workspaceId: number): Promise<Workspace> {
		const { data, sendRequest } = useHttp();

		await sendRequest(`/workspaces/${workspaceId}`, {
			method: 'GET',
		});

		return data.value;
	}

	async updateWorkspace(workspace: Workspace): Promise<Workspace> {
		const { data, sendRequest } = useHttp();

		await sendRequest(`/workspaces/${workspace.id}`, {
			method: 'PUT',
			data: workspace,
		});

		return data.value;
	}

	async deleteWorkspace(workspaceId: number): Promise<void> {
		const { sendRequest } = useHttp();

		await sendRequest(`/workspaces/${workspaceId}`, {
			method: 'DELETE',
		});
	}
}
