<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import CommandsDialog from '@/components/common/commands/CommandsDialog.vue';
import BaseDialog from '@/components/common/dialogs/BaseDialog.vue';
import SnackbarWrapper from '@/components/common/SnackbarWrapper.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ProjectLayout from '@/layouts/ProjectLayout.vue';
import { useWorkspaceStore } from '@/stores/workspace';
import { WorkspaceTypes } from '@/components/project-management/workspaces/types';

const workspaceStore = useWorkspaceStore();
</script>

<template>
  <template
    v-if="
      workspaceStore.selectedWorkspace?.workspaceType ===
      WorkspaceTypes.PROJECT_MANAGEMENT
    "
  >
    <project-layout>
      <router-view />
    </project-layout>
  </template>
  <template v-else>
    <default-layout>
      <router-view />
    </default-layout>
  </template>
  <commands-dialog />
  <base-dialog />
  <snackbar-wrapper />
  <VueQueryDevtools />
</template>
