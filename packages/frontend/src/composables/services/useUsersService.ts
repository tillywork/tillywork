import { useHttp } from '@/composables/useHttp';
import type { User } from '@/modules/common/users/types';

export interface UsersData {
  users: User[];
  total: number;
}

export const useUsersService = () => {
  async function getUsers() {
    const { sendRequest } = useHttp();

    return sendRequest('/users', {
      method: 'GET',
    });
  }

  return {
    getUsers,
  };
};
