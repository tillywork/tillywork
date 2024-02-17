import { useAuthStore } from '@/stores/auth';

export const useAuth = () => {
  const {
    login,
    user,
    token,
    refreshToken,
    setToken,
    isAuthenticated,
    logout,
    selectedProjectId,
    setSelectedProject,
  } = useAuthStore();

  return {
    login,
    user,
    token,
    refreshToken,
    setToken,
    isAuthenticated,
    logout,
    selectedProjectId,
    setSelectedProject,
  };
};
