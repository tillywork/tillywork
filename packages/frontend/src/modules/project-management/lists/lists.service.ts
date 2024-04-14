import { useHttp } from '@/composables/useHttp';
import type { List } from './types';

export interface ListsData {
	lists: List[];
	total: number;
}

export class ListsService {
	async getLists({
		workspaceId
	}: { workspaceId?: number }): Promise<List[]> {
		const { data, sendRequest } = useHttp();

		await sendRequest('/lists', {
			method: 'GET',
			params: {
				workspaceId,
			}
		});

		return data.value;
	}

	async createList(space: Partial<List>): Promise<List> {
		const { data, sendRequest } = useHttp();

		await sendRequest('/lists', {
			method: 'POST',
			data: space,
		});

		return data.value;
	}

	async getList(spaceId: number): Promise<List> {
		const { data, sendRequest } = useHttp();

		await sendRequest(`/lists/${spaceId}`, {
			method: 'GET',
		});

		return data.value;
	}

	async updateList(space: List): Promise<List> {
		const { data, sendRequest } = useHttp();

		await sendRequest(`/lists/${space.id}`, {
			method: 'PUT',
			data: space,
		});

		return data.value;
	}

	async deleteList(spaceId: number): Promise<void> {
		const { sendRequest } = useHttp();

		await sendRequest(`/lists/${spaceId}`, {
			method: 'DELETE',
		});
	}
}
