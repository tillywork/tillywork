<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import CommandsDialog from '@/components/common/commands/CommandsDialog.vue';
import BaseDialog from '@/components/common/dialogs/BaseDialog.vue';
import BaseSnackbarWrapper from '@/components/common/base/BaseSnackbarWrapper.vue';
import CrmLayout from '@/layouts/CrmLayout.vue';
import ProjectLayout from '@/layouts/ProjectLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useState } from '@/composables/useState';
import { WorkspaceTypes } from '@/components/project-management/workspaces/types';
import { useWorkspacesService } from '@/composables/services/useWorkspacesService';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '@/components/common/dialogs/types';
import { useAuthStore } from '@/stores/auth';
import { useProjectsService } from '@/composables/services/useProjectsService';

const workspacesService = useWorkspacesService();
const projectsService = useProjectsService();
const { stateStore } = useState();
const dialog = useDialog();
const authStore = useAuthStore();
const { isAuthenticated, setProject } = authStore;
const { project } = storeToRefs(authStore);
const projectsEnabled = computed(() => !project.value && isAuthenticated());
const workspacesEnabled = computed(() => !!project.value && isAuthenticated());

const { data: workspaces } = workspacesService.useGetWorkspacesQuery({
  enabled: workspacesEnabled,
});
const { data: projects } = projectsService.useGetProjectsQuery({
  enabled: projectsEnabled,
});

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
    } else if (v.length && !stateStore.selectedModule) {
      stateStore.setSelectedModule(v[0].type);
    }
  }
});

watch(projects, (v) => {
  if (v && v.length && !project.value) {
    setProject(v[0]);
  }
});
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
  <commands-dialog />
  <base-dialog />
  <base-snackbar-wrapper />
  <VueQueryDevtools />
</template>
