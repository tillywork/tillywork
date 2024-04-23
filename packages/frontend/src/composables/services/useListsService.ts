import { useHttp } from '@/composables/useHttp';
import type { List } from '../../modules/project-management/lists/types';

export interface ListsData {
  lists: List[];
  total: number;
}

export const useListsService = () => {
  async function getLists({
    workspaceId,
  }: {
    workspaceId?: number;
  }): Promise<List[]> {
    const { sendRequest } = useHttp();

    return sendRequest('/lists', {
      method: 'GET',
      params: {
        workspaceId,
      },
    });
  }

  async function createList(list: Partial<List>): Promise<List> {
    const { sendRequest } = useHttp();

    return sendRequest('/lists', {
      method: 'POST',
      data: list,
    });
  }

  async function getList(id: number): Promise<List> {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${id}`, {
      method: 'GET',
    });
  }

  async function updateList(list: List): Promise<List> {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${list.id}`, {
      method: 'PUT',
      data: list,
    });
  }

  async function deleteList(id: number): Promise<void> {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  return {
    getLists,
    getList,
    createList,
    updateList,
    deleteList,
  };
};
