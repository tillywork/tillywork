import { useHttp } from '@/composables/useHttp';
import type { User } from '@/components/common/users/types';
import { useQuery } from '@tanstack/vue-query';

export interface UsersData {
  users: User[];
  total: number;
}

export const useUsersService = () => {
  const { sendRequest } = useHttp();

  async function getUsers(): Promise<UsersData> {
    return sendRequest('/users', {
      method: 'GET',
    });
  }

  function useUsersQuery() {
    return useQuery({
      queryKey: ['users'],
      queryFn: getUsers,
      refetchOnWindowFocus: false,
    });
  }

  return {
    getUsers,
    useUsersQuery,
  };
};
