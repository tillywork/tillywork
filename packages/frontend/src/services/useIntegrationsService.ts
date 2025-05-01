import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { IntegrationType, type UserIntegration } from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export type GetIntegrationsParams = {
  type?: MaybeRef<IntegrationType>;
};

export type GetIntegrationParams = {
  type: MaybeRef<IntegrationType>;
};

export const useIntegrationsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  function getIntegrations({
    type,
  }: GetIntegrationsParams): Promise<UserIntegration[]> {
    return sendRequest('/user-integrations', {
      params: {
        type: toValue(type),
      },
    });
  }

  function useGetIntegrations({ type }: GetIntegrationsParams) {
    return useQuery({
      queryKey: ['integrations', { type }],
      queryFn: () => getIntegrations({ type }),
      staleTime: 1000 * 60 * 1,
    });
  }

  function getIntegration({
    type,
  }: GetIntegrationParams): Promise<UserIntegration> {
    return sendRequest(`/user-integrations/${toValue(type)}`);
  }

  function useGetIntegration({ type }: GetIntegrationParams) {
    return useQuery({
      queryKey: ['integrations', { type }],
      queryFn: () => getIntegration({ type }),
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 1,
    });
  }

  function deleteIntegration({ type }: GetIntegrationParams): Promise<void> {
    return sendRequest(`/user-integrations/${toValue(type)}`, {
      method: 'DELETE',
    });
  }

  function useDeleteIntegration() {
    return useMutation({
      mutationFn: deleteIntegration,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['integrations'] });
      },
    });
  }

  function getAuthUrl({
    integration,
  }: {
    integration: MaybeRef<IntegrationType>;
  }): Promise<{ url: string }> {
    return sendRequest('/user-integrations/auth', {
      params: {
        integration,
      },
    });
  }

  return {
    useGetIntegrations,
    useGetIntegration,
    useDeleteIntegration,
    getAuthUrl,
  };
};
