import { useHttp } from '@/composables/useHttp';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { View } from '@tillywork/shared';

export interface ViewsData {
  views: View[];
  total: number;
}

export const useViewsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getViews({ listId }: { listId: number }): Promise<View[]> {
    return sendRequest('/views', {
      method: 'GET',
      params: {
        listId,
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

  async function updateView(view: Partial<View>): Promise<View> {
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

  function useGetViewsQuery({ listId }: { listId: Ref<number> }) {
    return useQuery({
      queryKey: [
        'views',
        {
          listId,
        },
      ],
      queryFn: () => getViews({ listId: listId.value }),
      staleTime: 1 * 60 * 1000,
    });
  }

  function useGetViewQuery({
    id,
    enabled,
  }: {
    id: Ref<number>;
    enabled?: Ref<boolean>;
  }) {
    return useQuery({
      queryKey: ['views', id.value],
      queryFn: () => getView(id.value),
      staleTime: 1 * 60 * 1000,
      enabled,
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
    useGetViewsQuery,
    useGetViewQuery,
    useCreateViewMutation,
    useUpdateViewMutation,
    useDeleteViewMutation,
  };
};
