import { useHttp } from '@/composables/useHttp';
import type { ListStage } from '../../components/project-management/lists/types';

export const useListStagesService = () => {
  async function getListStages({
    listId,
  }: {
    listId: number;
  }): Promise<ListStage[]> {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${listId}/stages`, {
      method: 'GET',
    });
  }

  async function createListStage(list: Partial<ListStage>): Promise<ListStage> {
    const { sendRequest } = useHttp();

    return sendRequest('/lists', {
      method: 'POST',
      data: list,
    });
  }

  async function getListStage(id: number): Promise<ListStage> {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${id}`, {
      method: 'GET',
    });
  }

  async function updateListStage(list: ListStage): Promise<ListStage> {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${list.id}`, {
      method: 'PUT',
      data: list,
    });
  }

  async function deleteListStage(id: number): Promise<void> {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  return {
    getListStages,
    getListStage,
    createListStage,
    updateListStage,
    deleteListStage,
  };
};
