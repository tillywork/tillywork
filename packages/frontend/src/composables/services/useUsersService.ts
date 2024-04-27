import { useHttp } from '@/composables/useHttp';
import type { User } from '@/components/common/users/types';

export interface UsersData {
  users: User[];
  total: number;
}

export const useUsersService = () => {
  async function getUsers(): Promise<UsersData> {
    const { sendRequest } = useHttp();

    return sendRequest('/users', {
      method: 'GET',
    });
  }

  return {
    getUsers,
  };
};
