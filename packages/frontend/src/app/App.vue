<script setup lang="ts">
import BaseSnackbarWrapper from '@/components/common/base/BaseSnackbarWrapper.vue';
import BaseDialog from '@/components/common/dialogs/BaseDialog.vue';
import { DIALOGS } from '@/components/common/dialogs/types';
import { WorkspaceTypes } from '@/components/project-management/workspaces/types';
import { useProjectsService } from '@/services/useProjectsService';
import { useWorkspacesService } from '@/services/useWorkspacesService';
import { useCommands } from '@/composables/useCommands';
import { useState } from '@/composables/useState';
import CrmLayout from '@/layouts/CrmLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ProjectLayout from '@/layouts/ProjectLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useDialogStore } from '@/stores/dialog';
import { useThemeStore } from '@/stores/theme';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import posthog from 'posthog-js';
import { useTheme } from 'vuetify';
import BaseCommandPalette from '@/components/common/commands/BaseCommandPalette.vue';
import { useUsersService } from '@/services/useUsersService';

const themeStore = useThemeStore();
const {
  registerInputFocusAndBlurListeners,
  registerCommandShortcutWatchers,
  watchForCommandChanges,
  isCommandsEnabled,
} = useCommands();
const workspacesService = useWorkspacesService();
const projectsService = useProjectsService();
const { updateUserMutation } = useUsersService();
const { stateStore } = useState();
const dialogStore = useDialogStore();
const authStore = useAuthStore();
const { isAuthenticated, setProject } = authStore;
const { project, user, workspace } = storeToRefs(authStore);
const projectsEnabled = computed(() => !project.value && isAuthenticated());
const workspacesEnabled = computed(() => !!project.value && isAuthenticated());

const { data: workspaces } = workspacesService.useGetWorkspacesQuery({
  enabled: workspacesEnabled,
});
const { data: projects } = projectsService.useGetProjectsQuery({
  enabled: projectsEnabled,
});

const { mutateAsync: updateUser } = updateUserMutation();

if (import.meta.env.MODE === 'production' && isAuthenticated()) {
  posthog.identify(`${user.value?.id}`, {
    email: user.value?.email,
    name: `${user.value?.firstName} ${user.value?.lastName}`,
  });
}

/*
 * This handles setting the user's theme mode (dark or light)
 * across the application and setting it on Vuetify settings
 * when the application is opened and when the value is changed.
 * Default: dark
 */
const appTheme = useTheme();
watch(
  () => themeStore.theme,
  (theme) => {
    appTheme.global.name.value = theme;
  },
  {
    immediate: true,
  }
);

watch(workspaces, (v) => {
  if (v) {
    if (!v.length) {
      dialogStore.openDialog({
        dialog: DIALOGS.ONBOARDING,
        options: {
          fullscreen: true,
          persistent: true,
        },
      });
    } else if (v.length) {
      if (!stateStore.selectedModule) {
        stateStore.setSelectedModule(v[0].type);
      }
      if (!workspace) {
        authStore.setWorkspace(v[0]);
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
  isCommandsEnabled,
  (v) => {
    if (v) {
      registerCommandShortcutWatchers();
      watchForCommandChanges();
    }
  },
  { immediate: true }
);

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

registerInputFocusAndBlurListeners();
</script>

<template>
  <template
    v-if="stateStore.selectedModule === WorkspaceTypes.PROJECT_MANAGEMENT"
  >
    <project-layout>
      <router-view />
    </project-layout>
  </template>
  <template v-else-if="stateStore.selectedModule === WorkspaceTypes.CRM">
    <crm-layout>
      <router-view />
    </crm-layout>
  </template>
  <template v-else>
    <default-layout>
      <router-view />
    </default-layout>
  </template>
  <base-dialog />
  <base-snackbar-wrapper />
  <base-command-palette v-if="isCommandsEnabled" />
  <VueQueryDevtools />
</template>
