import type { MaybeRef } from 'vue';
import { useHttp } from '@/composables/useHttp';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type {
  ListGroup,
  SortOption,
  ViewGroupByOption,
} from '@tillywork/shared';

export interface GetListGroupsByOptionParams {
  listId: MaybeRef<number>;
  hideCompleted: MaybeRef<boolean>;
  groupBy: MaybeRef<ViewGroupByOption>;
  sortCardsBy?: MaybeRef<SortOption[]>;
}

export type GetListGroupsQueryParams = GetListGroupsByOptionParams & {
  enabled?: Ref<boolean>;
  viewId: MaybeRef<number>;
};

export const useListGroupsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getListGroupsByOption({
    listId,
    groupBy,
    sortCardsBy,
    hideCompleted,
  }: GetListGroupsByOptionParams): Promise<ListGroup[]> {
    return sendRequest(`/lists/${toValue(listId)}/groups`, {
      method: 'POST',
      data: {
        hideCompleted: toValue(hideCompleted),
        groupBy: toValue(groupBy).type,
        fieldId: toValue(groupBy).fieldId,
        sortCardsBy: toValue(sortCardsBy),
      },
    });
  }

  async function update(listGroup: Partial<ListGroup>) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return sendRequest(`/lists/${listGroup.list!.id}/groups/${listGroup.id}`, {
      method: 'PUT',
      data: listGroup,
    });
  }

  function useGetListGroupsByOptionQuery(params: GetListGroupsQueryParams) {
    const { listId, hideCompleted, groupBy, sortCardsBy, viewId } = params;
    const getListGroupsQuery = useQuery({
      queryKey: [
        'listGroups',
        { listId, viewId, hideCompleted, groupBy, sortCardsBy },
      ],
      queryFn: () =>
        getListGroupsByOption({
          listId,
          hideCompleted,
          groupBy,
          sortCardsBy,
        }),
      enabled: params.enabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

    return getListGroupsQuery;
  }

  function useUpdateListGroupMutation() {
    return useMutation({
      mutationFn: update,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['listGroups'],
        });
      },
    });
  }

  return {
    useGetListGroupsByOptionQuery,
    useUpdateListGroupMutation,
  };
};
