import { useHttp } from '@/composables/useHttp';

import { useQuery } from '@tanstack/vue-query';

import type { AccessControl } from '@tillywork/shared';

export const useAccessControlService = () => {
  const { sendRequest } = useHttp();

  async function getUserPermissions(): Promise<AccessControl[]> {
    return sendRequest('/access-control/me');
  }

  function useGetUserPermissions() {
    return useQuery({
      queryKey: ['accessControl'],
      queryFn: getUserPermissions,
    });
  }

  return {
    useGetUserPermissions,
  };
};
