import { useHttp } from '@/composables/useHttp';
import type {
  ListGroup,
  ListGroupOptions,
} from '../../components/project-management/lists/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { TableSortOption } from '@/components/project-management/views/TableView/types';

export interface GetListGroupsByOptionParams {
  listId: number;
  groupBy: ListGroupOptions;
  sortCardsBy?: TableSortOption[];
}

export type GetListGroupsQueryParams = {
  listId: number;
  groupBy: Ref<ListGroupOptions>;
  sortCardsBy?: Ref<TableSortOption[] | undefined>;
  enabled?: Ref<boolean>;
};

export const useListGroupsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getListGroupsByOption({
    listId,
    groupBy,
    sortCardsBy,
  }: GetListGroupsByOptionParams): Promise<ListGroup[]> {
    return sendRequest(`/lists/${listId}/groups`, {
      method: 'POST',
      data: {
        groupBy,
        sortCardsBy,
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
          sortCardsBy: params.sortCardsBy?.value,
        }),
      enabled: params.enabled,
      staleTime: 1 * 60 * 1000,
    });

    return getListGroupsQuery;
  }

  function useUpdateListGroupMutation() {
    return useMutation({
      mutationFn: update,
      onSuccess: (listGroup) => {
        queryClient.invalidateQueries({
          queryKey: [
            'listGroups',
            {
              listId: listGroup.listId,
            },
          ],
        });
      },
    });
  }

  return {
    useGetListGroupsByOptionQuery,
    useUpdateListGroupMutation,
  };
};
