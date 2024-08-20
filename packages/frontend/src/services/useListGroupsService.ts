import type { MaybeRef } from 'vue';
import { useHttp } from '@/composables/useHttp';
import type { ListGroup } from '@/components/project-management/lists/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { TableSortOption } from '@/components/project-management/views/types';
import type { ViewGroupByOption } from '@tillywork/shared';

export interface GetListGroupsByOptionParams {
  listId: MaybeRef<number>;
  hideCompleted: MaybeRef<boolean>;
  groupBy: MaybeRef<ViewGroupByOption>;
  sortCardsBy?: MaybeRef<TableSortOption[]>;
}

export type GetListGroupsQueryParams = GetListGroupsByOptionParams & {
  enabled?: Ref<boolean>;
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
    const groupByValue = computed(() => toValue(groupBy));

    return sendRequest(`/lists/${toValue(listId)}/groups`, {
      method: 'POST',
      data: {
        hideCompleted: toValue(hideCompleted),
        groupBy: groupByValue.value.type,
        fieldId: groupByValue.value.fieldId,
        sortCardsBy: toValue(sortCardsBy),
      },
    });
  }

  async function update(listGroup: Partial<ListGroup>) {
    return sendRequest(`/lists/${listGroup.list!.id}/groups/${listGroup.id}`, {
      method: 'PUT',
      data: listGroup,
    });
  }

  function useGetListGroupsByOptionQuery(params: GetListGroupsQueryParams) {
    const { listId, hideCompleted, groupBy, sortCardsBy } = params;
    const getListGroupsQuery = useQuery({
      queryKey: ['listGroups', { listId: toValue(listId) }],
      queryFn: () =>
        getListGroupsByOption({
          listId,
          hideCompleted,
          groupBy,
          sortCardsBy,
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
