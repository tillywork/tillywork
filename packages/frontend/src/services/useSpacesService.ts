import { useHttp } from '@/composables/useHttp';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { Space } from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export interface SpacesData {
  spaces: Space[];
  total: number;
}

export const useSpacesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getSpaces({
    workspaceId,
    lists,
  }: {
    workspaceId?: MaybeRef<number>;
    lists?: MaybeRef<boolean>;
  }): Promise<Space[]> {
    return sendRequest('/spaces', {
      method: 'GET',
      params: {
        workspaceId: toValue(workspaceId),
        lists: toValue(lists),
      },
    });
  }

  async function createSpace(space: Partial<Space>): Promise<Space> {
    return sendRequest('/spaces', {
      method: 'POST',
      data: space,
    });
  }

  async function getSpace(spaceId: number): Promise<Space> {
    return sendRequest(`/spaces/${spaceId}`, {
      method: 'GET',
    });
  }

  async function updateSpace(space: Space): Promise<Space> {
    return sendRequest(`/spaces/${space.id}`, {
      method: 'PUT',
      data: space,
    });
  }

  async function deleteSpace(spaceId: number): Promise<void> {
    return sendRequest(`/spaces/${spaceId}`, {
      method: 'DELETE',
    });
  }

  function useGetSpacesQuery({
    workspaceId,
    lists,
    enabled,
  }: {
    workspaceId: MaybeRef<number>;
    lists?: MaybeRef<boolean>;
    enabled?: Ref<boolean>;
  }) {
    return useQuery({
      queryKey: ['spaces', { workspaceId, lists }],
      queryFn: () =>
        getSpaces({
          workspaceId,
          lists,
        }),
      enabled,
    });
  }

  function useGetSpaceQuery(spaceId: number) {
    return useQuery({
      queryKey: ['space', spaceId],
      queryFn: () => getSpace(spaceId),
    });
  }

  function useCreateSpaceMutation() {
    return useMutation({
      mutationFn: createSpace,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
      },
    });
  }

  function useUpdateSpaceMutation() {
    return useMutation<Space, Error, Space>({
      mutationFn: updateSpace,
      onSuccess: (updatedSpace) => {
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
        queryClient.invalidateQueries({ queryKey: ['space', updatedSpace.id] });
      },
    });
  }

  function useDeleteSpaceMutation() {
    return useMutation<void, Error, number>({
      mutationFn: deleteSpace,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
      },
    });
  }

  return {
    useGetSpacesQuery,
    useGetSpaceQuery,
    useCreateSpaceMutation,
    useUpdateSpaceMutation,
    useDeleteSpaceMutation,
  };
};
