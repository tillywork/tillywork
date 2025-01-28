import type { MaybeRef } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Automation } from '@/components/common/automations/types';
import { useHttp } from '@/composables/useHttp';

export type GetAllParams = {
  workspaceId: MaybeRef<number>;
  listId?: MaybeRef<number | undefined>;
  spaceId?: MaybeRef<number | undefined>;
};

export const useAutomationService = () => {
  const { sendRequest } = useHttp();

  function getAutomations({
    workspaceId,
    listId,
    spaceId,
  }: GetAllParams): Promise<Automation[]> {
    return sendRequest(`/automations`, {
      params: {
        workspaceId: toValue(workspaceId),
        listId: toValue(listId),
        spaceId: toValue(spaceId),
      },
    });
  }

  function useGetAutomations({ workspaceId, listId, spaceId }: GetAllParams) {
    return useQuery({
      queryKey: [
        'automations',
        {
          workspaceId: toValue(workspaceId),
        },
      ],
      queryFn: () => getAutomations({ workspaceId, listId, spaceId }),
    });
  }

  return {
    useGetAutomations,
  };
};
