<script setup lang="ts">
import BaseSnackbarWrapper from '@/components/common/base/BaseSnackbarWrapper.vue';
import BaseDialog from '@/components/common/dialogs/BaseDialog.vue';
import { useCommands } from '@/composables/useCommands';
import { useState } from '@/composables/useState';
import CrmLayout from '@/layouts/CrmLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ProjectLayout from '@/layouts/ProjectLayout.vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import BaseCommandPalette from '@/components/common/commands/BaseCommandPalette.vue';
import { WorkspaceTypes } from '@tillywork/shared';

const {
  registerInputFocusAndBlurListeners,
  registerCommandShortcutWatchers,
  watchForCommandChanges,
  isCommandsEnabled,
} = useCommands();
const { selectedModule } = useState();

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

registerInputFocusAndBlurListeners();
</script>

<template>
  <template v-if="selectedModule === WorkspaceTypes.PROJECT_MANAGEMENT">
    <project-layout>
      <router-view />
    </project-layout>
  </template>
  <template v-else-if="selectedModule === WorkspaceTypes.CRM">
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
