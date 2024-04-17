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

	async createList(list: Partial<List>): Promise<List> {
		const { data, sendRequest } = useHttp();

		await sendRequest('/lists', {
			method: 'POST',
			data: list,
		});

		return data.value;
	}

	async getList(id: number): Promise<List> {
		const { data, sendRequest } = useHttp();

		await sendRequest(`/lists/${id}`, {
			method: 'GET',
		});

		return data.value;
	}

	async updateList(list: List): Promise<List> {
		const { data, sendRequest } = useHttp();

		await sendRequest(`/lists/${list.id}`, {
			method: 'PUT',
			data: list,
		});

		return data.value;
	}

	async deleteList(id: number): Promise<void> {
		const { sendRequest } = useHttp();

		await sendRequest(`/lists/${id}`, {
			method: 'DELETE',
		});
	}
}
