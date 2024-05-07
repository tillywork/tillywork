import { useHttp } from '@/composables/useHttp';
import type { View } from '../../components/project-management/views/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

export interface ViewsData {
  views: View[];
  total: number;
}

export const useViewsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getViews({
    workspaceId,
  }: {
    workspaceId?: number;
  }): Promise<View[]> {
    return sendRequest('/views', {
      method: 'GET',
      params: {
        workspaceId,
      },
    });
  }

  async function createView(view: Partial<View>): Promise<View> {
    return sendRequest('/views', {
      method: 'POST',
      data: view,
    });
  }

  async function getView(id: number): Promise<View> {
    return sendRequest(`/views/${id}`, {
      method: 'GET',
    });
  }

  async function updateView(view: View): Promise<View> {
    return sendRequest(`/views/${view.id}`, {
      method: 'PUT',
      data: view,
    });
  }

  async function deleteView(id: number): Promise<void> {
    return sendRequest(`/views/${id}`, {
      method: 'DELETE',
    });
  }

  function useGetViewsQuery(workspaceId?: number) {
    return useQuery({
      queryKey: ['views', workspaceId],
      queryFn: () => getViews({ workspaceId }),
    });
  }

  function useGetViewQuery(id: number) {
    return useQuery({
      queryKey: ['view', id],
      queryFn: () => getView(id),
    });
  }

  function useCreateViewMutation() {
    return useMutation({
      mutationFn: createView,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['views'] });
      },
    });
  }

  function useUpdateViewMutation() {
    return useMutation({
      mutationFn: updateView,
      onSuccess: (updatedView) => {
        queryClient.invalidateQueries({ queryKey: ['views'] });
        queryClient.invalidateQueries({ queryKey: ['view', updatedView.id] });
      },
    });
  }

  function useDeleteViewMutation() {
    return useMutation({
      mutationFn: deleteView,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['views'] });
      },
    });
  }

  return {
    getViews,
    getView,
    createView,
    updateView,
    deleteView,
    useGetViewsQuery,
    useGetViewQuery,
    useCreateViewMutation,
    useUpdateViewMutation,
    useDeleteViewMutation,
  };
};
