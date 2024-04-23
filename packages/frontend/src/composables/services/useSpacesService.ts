import { useHttp } from '@/composables/useHttp';
import type { Space } from '../../modules/project-management/spaces/types';

export interface SpacesData {
  spaces: Space[];
  total: number;
}

export const useSpacesService = () => {
  async function getSpaces({
    workspaceId,
  }: {
    workspaceId?: number;
  }): Promise<Space[]> {
    const { sendRequest } = useHttp();

    return sendRequest('/spaces', {
      method: 'GET',
      params: {
        workspaceId,
      },
    });
  }

  async function createSpace(space: Partial<Space>): Promise<Space> {
    const { sendRequest } = useHttp();

    return sendRequest('/spaces', {
      method: 'POST',
      data: space,
    });
  }

  async function getSpace(spaceId: number): Promise<Space> {
    const { sendRequest } = useHttp();

    return sendRequest(`/spaces/${spaceId}`, {
      method: 'GET',
    });
  }

  async function updateSpace(space: Space): Promise<Space> {
    const { sendRequest } = useHttp();

    return sendRequest(`/spaces/${space.id}`, {
      method: 'PUT',
      data: space,
    });
  }

  async function deleteSpace(spaceId: number): Promise<void> {
    const { sendRequest } = useHttp();

    return sendRequest(`/spaces/${spaceId}`, {
      method: 'DELETE',
    });
  }

  return {
    getSpaces,
    getSpace,
    createSpace,
    updateSpace,
    deleteSpace,
  };
};
