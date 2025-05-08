import { useAuthStore } from '@/stores/auth';
import { useDialogStore } from '@/stores/dialog';
import { useStateStore } from '@/stores/state';
import { useThemeStore } from '@/stores/theme';

import { useProjectsService } from '@/services/useProjectsService';
import { useUsersService } from '@/services/useUsersService';
import { useWorkspacesService } from '@/services/useWorkspacesService';

import { useSocket } from '@/composables/useSocket';
import { useNotificationSocket } from '@/composables/useNotificationSocket';

import { DIALOGS } from '@/components/common/dialogs/types';
import { WorkspaceTypes } from '@tillywork/shared';

import posthog from 'posthog-js';
import { useTheme } from 'vuetify';

/**
 * Used in App.vue to handle application state. Sets the app's theme, selected module,
 * and whether or not to trigger onboarding dialog.
 */
export const useState = () => {
  // Route
  const route = useRoute();

  // Stores
  const authStore = useAuthStore();
  const dialogStore = useDialogStore();
  const stateStore = useStateStore();
  const themeStore = useThemeStore();

  // Store Refs
  const { selectedModule } = storeToRefs(stateStore);
  const { project, user, workspace } = storeToRefs(authStore);
  const { theme } = storeToRefs(themeStore);

  // Store Functions
  const { setSelectedModule, navigateToLastList } = stateStore;
  const { isAuthenticated, setProject, setWorkspace, clearWorkspace } =
    authStore;

  // Computed Properties
  const projectsEnabled = computed(() => !project.value && isAuthenticated());
  const workspacesEnabled = computed(
    () => !!project.value && isAuthenticated()
  );

  // Services
  const { useGetWorkspacesQuery } = useWorkspacesService();
  const { useGetProjectsQuery } = useProjectsService();
  const { updateUserMutation } = useUsersService();
  const { mutateAsync: updateUser } = updateUserMutation();

  // Query Results
  const { data: workspaces } = useGetWorkspacesQuery({
    enabled: workspacesEnabled,
  });
  const { data: projects } = useGetProjectsQuery({
    enabled: projectsEnabled,
  });

  // Socket Management
  const { connect } = useSocket();
  const { createListeners } = useNotificationSocket();

  /**
   * Updates the application state based on current workspaces and selected module
   */
  function updateAppState() {
    // Skip if not authenticated
    if (!isAuthenticated()) {
      return;
    }

    // Check if workspaces data is available
    if (!workspaces.value) {
      console.log('Waiting for workspaces data...');
      return;
    }

    // If no workspaces exist, open onboarding dialog
    if (workspaces.value.length === 0) {
      dialogStore.openDialog({
        dialog: DIALOGS.ONBOARDING,
        options: {
          fullscreen: true,
          persistent: true,
        },
      });
      return;
    }

    // If a module is selected, filter workspaces by module
    if (selectedModule.value) {
      const moduleWorkspaces = workspaces.value.filter(
        (w) => w.type === selectedModule.value
      );

      if (moduleWorkspaces.length > 0) {
        setWorkspace(moduleWorkspaces[0]);
      } else {
        clearWorkspace();
      }
      return;
    }

    // If a workspace is selected, ensure it still exists
    if (workspace.value) {
      const existingWorkspace = workspaces.value.find(
        (w) => w.id === workspace.value?.id
      );

      if (existingWorkspace) {
        setSelectedModule(existingWorkspace.type);
        setWorkspace(existingWorkspace);
      } else {
        setFirstWorkspace();
      }
      return;
    }

    // If no workspace or module is selected, set the first workspace
    setFirstWorkspace();
  }

  /**
   * Sets the first available workspace as active
   */
  function setFirstWorkspace() {
    if (workspaces.value?.length) {
      const firstWorkspace = workspaces.value[0];
      setSelectedModule(firstWorkspace.type);
      setWorkspace(firstWorkspace);
    }
  }

  /**
   * Initialize all watchers for the application state
   */
  function initWatchers() {
    // Watch route changes to update selected module
    watch(
      route,
      (newRoute) => {
        if (newRoute.path.startsWith('/pm')) {
          setSelectedModule(WorkspaceTypes.PROJECT_MANAGEMENT);
        } else if (newRoute.path.startsWith('/crm')) {
          setSelectedModule(WorkspaceTypes.CRM);
        }
      },
      { immediate: true }
    );

    // Watch theme changes to update Vuetify theme
    const appTheme = useTheme();
    watch(
      theme,
      (newTheme) => {
        appTheme.global.name.value = newTheme;
      },
      { immediate: true }
    );

    // Watch workspaces changes
    watch(workspaces, (newWorkspaces) => {
      if (newWorkspaces) {
        updateAppState();
      }
    });

    // Watch projects changes
    watch(projects, (newProjects) => {
      if (newProjects?.length && !project.value) {
        setProject(newProjects[0]);
      }
    });

    // Watch project changes to update user preferences
    watch(
      project,
      (newProject) => {
        if (newProject && user.value) {
          updateUser({
            ...user.value,
            project: newProject,
          });
        }
      },
      { immediate: true }
    );

    // Watch user changes for analytics
    watch(
      user,
      (newUser) => {
        if (
          import.meta.env.MODE === 'production' &&
          isAuthenticated() &&
          newUser
        ) {
          posthog.identify(`${newUser.id}`, {
            email: newUser.email,
            name: `${newUser.firstName} ${newUser.lastName}`,
          });
        }
      },
      { immediate: true }
    );

    // Watch selectedModule changes
    watch(selectedModule, () => {
      updateAppState();
      navigateToLastList();
    });

    // Watch authentication state changes
    watch(
      () => isAuthenticated(),
      (isAuth) => {
        if (isAuth) {
          // Connect socket and initialize listeners on authentication
          connect(() => {
            createListeners();
          });
        }
      },
      { immediate: true }
    );
  }

  /**
   * Initialize the application
   * This is called from App.vue's onMounted hook
   */
  function initialize() {
    // Set up all watchers
    initWatchers();

    // Perform initial update if already authenticated
    if (isAuthenticated()) {
      updateAppState();
    }
  }

  return {
    // State
    selectedModule,

    // Methods
    initialize,
    initWatchers,
    updateAppState,
    setFirstWorkspace,
  };
};
