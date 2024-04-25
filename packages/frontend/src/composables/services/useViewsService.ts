import { useHttp } from '@/composables/useHttp';
import type { View } from '../../components/project-management/views/types';

export interface ViewsData {
  views: View[];
  total: number;
}

export const useViewsService = () => {
  async function getViews({
    workspaceId,
  }: {
    workspaceId?: number;
  }): Promise<View[]> {
    const { sendRequest } = useHttp();

    return sendRequest('/views', {
      method: 'GET',
      params: {
        workspaceId,
      },
    });
  }

  async function createView(view: Partial<View>): Promise<View> {
    const { sendRequest } = useHttp();

    return sendRequest('/views', {
      method: 'POST',
      data: view,
    });
  }

  async function getView(id: number): Promise<View> {
    const { sendRequest } = useHttp();

    return sendRequest(`/views/${id}`, {
      method: 'GET',
    });
  }

  async function updateView(view: View): Promise<View> {
    const { sendRequest } = useHttp();

    return sendRequest(`/views/${view.id}`, {
      method: 'PUT',
      data: view,
    });
  }

  async function deleteView(id: number): Promise<void> {
    const { sendRequest } = useHttp();

    return sendRequest(`/views/${id}`, {
      method: 'DELETE',
    });
  }

  return {
    getViews,
    getView,
    createView,
    updateView,
    deleteView,
  };
};
