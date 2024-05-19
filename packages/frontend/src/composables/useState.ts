import { WorkspaceTypes } from '@/components/project-management/workspaces/types';
import { useStateStore } from '@/stores/state';

export const useState = () => {
  const stateStore = useStateStore();
  const route = useRoute();

  watch(
    route,
    () => {
      if (route.path.startsWith('/pm')) {
        stateStore.setSelectedModule(WorkspaceTypes.PROJECT_MANAGEMENT);
      } else if (route.path.startsWith('/crm')) {
        stateStore.setSelectedModule(WorkspaceTypes.CRM);
      }
    },
    { immediate: true }
  );

  return {
    stateStore,
  };
};
