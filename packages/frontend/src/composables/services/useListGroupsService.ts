import { useHttp } from '@/composables/useHttp';
import type {
  ListGroup,
  ListGroupOptions,
} from '../../components/project-management/lists/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { type Ref } from 'vue';

export interface GetListGroupsByOptionParams {
  listId: number;
  groupBy: ListGroupOptions;
}

export type GetListGroupsQueryParams = {
  listId: number;
  groupBy: Ref<ListGroupOptions>;
  enabled: Ref<boolean>;
};

export const useListGroupsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getListGroupsByOption({
    listId,
    groupBy,
  }: GetListGroupsByOptionParams): Promise<ListGroup[]> {
    return sendRequest(`/lists/${listId}/groups`, {
      method: 'POST',
      data: {
        groupBy,
      },
    });
  }

  async function update(listGroup: Partial<ListGroup>) {
    return sendRequest(`/lists/${listGroup.listId}/groups/${listGroup.id}`, {
      method: 'PUT',
      data: listGroup,
    });
  }

  function useGetListGroupsByOptionQuery(params: GetListGroupsQueryParams) {
    const getListGroupsQuery = useQuery({
      queryKey: ['listGroups', { listId: params.listId }],
      queryFn: () =>
        getListGroupsByOption({
          listId: params.listId,
          groupBy: params.groupBy.value,
        }),
      enabled: params.enabled,
    });

    return getListGroupsQuery;
  }

  function useUpdateListGroupMutation() {
    return useMutation({
      mutationFn: update,
      onSuccess: (listGroup) => {
        queryClient.invalidateQueries({
          queryKey: ['listGroups', listGroup.listId],
        });
      },
    });
  }

  return {
    getListGroupsByOption,
    update,
    useGetListGroupsByOptionQuery,
    useUpdateListGroupMutation,
  };
};
