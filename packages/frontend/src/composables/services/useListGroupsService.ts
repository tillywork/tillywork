import { useHttp } from '@/composables/useHttp';
import type {
  ListGroup,
  ListGroupOptions,
} from '../../components/project-management/lists/types';

export const useListGroupsService = () => {
  async function getListGroupsByOption({
    listId,
    groupBy,
  }: {
    listId: number;
    groupBy: ListGroupOptions;
  }): Promise<ListGroup[]> {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${listId}/groups`, {
      method: 'POST',
      data: {
        groupBy,
      },
    });
  }

  async function update(listGroup: Partial<ListGroup>) {
    const { sendRequest } = useHttp();

    return sendRequest(`/lists/${listGroup.listId}/groups/${listGroup.id}`, {
      method: 'PUT',
      data: listGroup,
    });
  }

  return {
    getListGroupsByOption,
    update,
  };
};
