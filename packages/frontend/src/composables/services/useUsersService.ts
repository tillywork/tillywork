import type { User } from '@/components/common/users/types';
import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

export interface UsersData {
  users: User[];
  total: number;
}

export const useUsersService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

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
      staleTime: 5 * 60 * 1000,
    });
  }

  function updateUser(user: Partial<User>) {
    return sendRequest(`/users/${user.id}`, {
      method: 'PUT',
      data: user,
    });
  }

  function updateUserMutation() {
    return useMutation({
      mutationFn: updateUser,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
  }

  function getUserFullName(user: User) {
    return user.firstName + ' ' + user.lastName;
  }

  async function getUser(id: number): Promise<User> {
    return sendRequest(`/users/${id}`);
  }

  function useGetUserQuery(id: number) {
    return useQuery({
      queryKey: ['users', id],
      queryFn: () => getUser(id),
    });
  }

  return {
    useUsersQuery,
    updateUserMutation,
    getUserFullName,
    useGetUserQuery,
  };
};
