import { useProjectUsersService } from '@/services/useProjectUsersService';
import { useAuthStore } from '@/stores/auth';

export const useUsers = () => {
  const { project } = storeToRefs(useAuthStore());

  const { useProjectUsersQuery } = useProjectUsersService();

  const { data: users } = useProjectUsersQuery({
    projectId: project.value!.id,
    select: (projectUsers) => projectUsers.map((pU) => pU.user),
  });

  return {
    users,
  };
};
