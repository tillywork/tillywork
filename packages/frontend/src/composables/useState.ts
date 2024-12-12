import { DIALOGS } from '@/components/common/dialogs/types';
import { WorkspaceTypes } from '@/components/project-management/workspaces/types';

import { useProjectsService } from '@/services/useProjectsService';
import { useUsersService } from '@/services/useUsersService';
import { useWorkspacesService } from '@/services/useWorkspacesService';

import { useAuthStore } from '@/stores/auth';
import { useDialogStore } from '@/stores/dialog';
import { useStateStore } from '@/stores/state';
import { useThemeStore } from '@/stores/theme';

import posthog from 'posthog-js';
import { useTheme } from 'vuetify';

/**
 * Used in App.vue to handle application state. Sets the app's theme, selected module, and whether or not to trigger onboarding dialog.
 * @returns
 */
export const useState = () => {
  const { setSelectedModule, navigateToLastList } = useStateStore();
  const { selectedModule } = storeToRefs(useStateStore());
  const { isAuthenticated, setProject, setWorkspace } = useAuthStore();
  const { project, user, workspace } = storeToRefs(useAuthStore());

  const projectsEnabled = computed(() => !project.value && isAuthenticated());
  const workspacesEnabled = computed(
    () => !!project.value && isAuthenticated()
  );

  const dialog = useDialogStore();
  const route = useRoute();

  const { useGetWorkspacesQuery } = useWorkspacesService();
  const { useGetProjectsQuery } = useProjectsService();
  const { updateUserMutation } = useUsersService();

  const { mutateAsync: updateUser } = updateUserMutation();

  const { data: workspaces } = useGetWorkspacesQuery({
    type: selectedModule,
    enabled: workspacesEnabled,
  });
  const { data: projects } = useGetProjectsQuery({
    enabled: projectsEnabled,
  });

  watch(
    route,
    () => {
      if (route.path.startsWith('/pm')) {
        setSelectedModule(WorkspaceTypes.PROJECT_MANAGEMENT);
      } else if (route.path.startsWith('/crm')) {
        setSelectedModule(WorkspaceTypes.CRM);
      }
    },
    { immediate: true }
  );

  /*
   * This handles setting the user's theme mode (dark or light)
   * across the application and setting it on Vuetify settings
   * when the application is opened and when the value is changed.
   * Default: dark
   */
  const { theme } = storeToRefs(useThemeStore());
  const appTheme = useTheme();
  watch(
    theme,
    (v) => {
      appTheme.global.name.value = v;
    },
    {
      immediate: true,
    }
  );

  watch(workspaces, (v) => {
    if (v) {
      if (!v.length) {
        dialog.openDialog({
          dialog: DIALOGS.ONBOARDING,
          options: {
            fullscreen: true,
            persistent: true,
          },
        });
      } else if (v.length) {
        // If no module is currently selected, use the first workspace's module
        if (!selectedModule.value) {
          setSelectedModule(v[0].type);
        }

        // If no current workspace is selected, or the selected workspace type is different from the selected module, update current workspace
        if (
          !workspace.value ||
          (selectedModule.value &&
            workspace.value?.type !== selectedModule.value)
        ) {
          setWorkspace(v[0]);
        }
      }
    }
  });

  watch(projects, (v) => {
    if (v && v.length && !project.value) {
      setProject(v[0]);
    }
  });

  watch(
    project,
    (v) => {
      if (v && user.value) {
        updateUser({
          ...user.value,
          project: v,
        });
      }
    },
    { immediate: true }
  );

  watch(
    user,
    (v) => {
      if (import.meta.env.MODE === 'production' && isAuthenticated()) {
        posthog.identify(`${v?.id}`, {
          email: v?.email,
          name: `${v?.firstName} ${v?.lastName}`,
        });
      }
    },
    { immediate: true }
  );

  watch(selectedModule, () => {
    navigateToLastList();
  });

  return {
    selectedModule,
  };
};
