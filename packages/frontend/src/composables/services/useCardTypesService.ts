import { useQuery } from '@tanstack/vue-query';
import { useHttp } from '../useHttp';
import type { CardType } from '@/components/project-management/cards/types';

export const useCardTypesService = () => {
  const { sendRequest } = useHttp();

  function findAll({
    workspaceId,
  }: {
    workspaceId: number;
  }): Promise<CardType[]> {
    return sendRequest(`/card-types`, {
      method: 'GET',
      params: {
        workspaceId,
      },
    });
  }

  function useFindAllQuery({ workspaceId }: { workspaceId: number }) {
    return useQuery({
      queryKey: [
        'cardTypes',
        {
          workspaceId,
        },
      ],
      queryFn: () => findAll({ workspaceId }),
    });
  }

  return {
    useFindAllQuery,
  };
};
