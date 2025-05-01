import { useIntegrationsService } from '@/services/useIntegrationsService';
import type { IntegrationType } from '@tillywork/shared';

export const useIntegrations = () => {
  const { useGetEnabledIntegrations } = useIntegrationsService();

  const { data: enabledIntegrations } = useGetEnabledIntegrations();

  function isIntegrationEnabled(integration: IntegrationType) {
    return enabledIntegrations.value?.enabled.includes(integration);
  }

  return {
    enabledIntegrations,
    isIntegrationEnabled,
  };
};
