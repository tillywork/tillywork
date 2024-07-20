import type { MaybeRef } from 'vue';
import { useHttp } from '../useHttp';
import { useQuery } from '@tanstack/vue-query';
import type { Automation } from '@/components/common/automations/types';

export type GetAllParams = {
  workspaceId: MaybeRef<number>;
};

export const useAutomationService = () => {
  const { sendRequest } = useHttp();

  function getAutomations({
    workspaceId,
  }: GetAllParams): Promise<Automation[]> {
    return sendRequest(`/automations`, {
      params: {
        workspaceId: toValue(workspaceId),
      },
    });
  }

  function useGetAutomations({ workspaceId }: GetAllParams) {
    return useQuery({
      queryKey: [
        'automations',
        {
          workspaceId: toValue(workspaceId),
        },
      ],
      queryFn: () => getAutomations({ workspaceId }),
    });
  }

  return {
    useGetAutomations,
  };
};
