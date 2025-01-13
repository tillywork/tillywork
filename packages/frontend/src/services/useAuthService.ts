import type { CreateUserDto } from '@/components/common/users/types';
import { useHttp } from '@/composables/useHttp';

export const useAuthService = () => {
  const { sendRequest } = useHttp();

  function login(data: { email: string; password: string }) {
    return sendRequest('/auth/login', {
      method: 'POST',
      data,
    });
  }

  function register(createUserDto: CreateUserDto) {
    return sendRequest('/auth/register', {
      method: 'POST',
      data: createUserDto,
    });
  }

  function registerWithInvite(createUserDto: CreateUserDto) {
    return sendRequest(`/auth/invite/${createUserDto.inviteCode}`, {
      method: 'POST',
      data: createUserDto,
    });
  }

  function joinInvitation(inviteCode: string) {
    return sendRequest(`/auth/invite/${inviteCode}/join`, {
      method: 'POST',
    });
  }

  return {
    login,
    register,
    registerWithInvite,
    joinInvitation,
  };
};
