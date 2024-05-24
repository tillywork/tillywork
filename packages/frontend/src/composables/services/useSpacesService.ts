import { useHttp } from '@/composables/useHttp';
import type { Space } from '../../components/project-management/spaces/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

export interface SpacesData {
  spaces: Space[];
  total: number;
}

export const useSpacesService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getSpaces({
    workspaceId,
  }: {
    workspaceId?: number;
  }): Promise<Space[]> {
    return sendRequest('/spaces', {
      method: 'GET',
      params: {
        workspaceId,
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
    enabled,
  }: {
    workspaceId: MaybeRef<number | undefined>;
    enabled: Ref<boolean>;
  }) {
    return useQuery({
      queryKey: ['spaces', { workspaceId }],
      queryFn: () =>
        getSpaces({
          workspaceId:
            typeof workspaceId === 'number' ? workspaceId : workspaceId?.value,
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
