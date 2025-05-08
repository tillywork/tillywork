<script setup lang="ts">
import BaseSnackbarWrapper from '@/components/common/base/BaseSnackbarWrapper.vue';
import BaseDialog from '@/components/common/dialogs/BaseDialog.vue';
import BaseCommandPalette from '@/components/common/commands/BaseCommandPalette.vue';
import CrmLayout from '@/layouts/CrmLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ProjectLayout from '@/layouts/ProjectLayout.vue';

import { VueQueryDevtools } from '@tanstack/vue-query-devtools';

import { useState } from '@/composables/useState';
import { useAuthStore } from '@/stores/auth';
import { WorkspaceTypes } from '@tillywork/shared';

const { selectedModule, initialize } = useState();
const { isAuthenticated } = useAuthStore();

onMounted(() => {
  initialize();
});
</script>

<template>
  <template v-if="selectedModule === WorkspaceTypes.PROJECT_MANAGEMENT">
    <project-layout>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </project-layout>
  </template>
  <template v-else-if="selectedModule === WorkspaceTypes.CRM">
    <crm-layout>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </crm-layout>
  </template>
  <template v-else>
    <default-layout>
      <router-view />
    </default-layout>
  </template>

  <base-dialog />
  <base-snackbar-wrapper />
  <base-command-palette v-if="isAuthenticated()" />

  <VueQueryDevtools />
</template>
