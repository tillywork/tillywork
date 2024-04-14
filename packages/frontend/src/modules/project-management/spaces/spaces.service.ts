import { useHttp } from '@/composables/useHttp';
import type { Space } from './types';

export interface SpacesData {
	spaces: Space[];
	total: number;
}

export class SpacesService {
	async getSpaces({
		workspaceId
	}: { workspaceId?: number }): Promise<Space[]> {
		const { data, sendRequest } = useHttp();

		await sendRequest('/spaces', {
			method: 'GET',
			params: {
				workspaceId,
			}
		});

		return data.value;
	}

	async createSpace(space: Partial<Space>): Promise<Space> {
		const { data, sendRequest } = useHttp();

		await sendRequest('/spaces', {
			method: 'POST',
			data: space,
		});

		return data.value;
	}

	async getSpace(spaceId: number): Promise<Space> {
		const { data, sendRequest } = useHttp();

		await sendRequest(`/spaces/${spaceId}`, {
			method: 'GET',
		});

		return data.value;
	}

	async updateSpace(space: Space): Promise<Space> {
		const { data, sendRequest } = useHttp();

		await sendRequest(`/spaces/${space.id}`, {
			method: 'PUT',
			data: space,
		});

		return data.value;
	}

	async deleteSpace(spaceId: number): Promise<void> {
		const { sendRequest } = useHttp();

		await sendRequest(`/spaces/${spaceId}`, {
			method: 'DELETE',
		});
	}
}
