<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { WorkspaceTypes, type Workspace } from '../workspaces/types';
import {
  useWorkspacesService,
  type WorkspacesData,
} from '@/composables/services/useWorkspacesService';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';
import CreateWorkspaceDialogAndButton from './CreateWorkspaceDialogAndButton.vue';

const workspacesService = useWorkspacesService();
const workspaces = ref<WorkspacesData>();
const selectWorkspaceMenu = ref(false);
const workspaceStore = useWorkspaceStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);

function closeSelectWorkspaceMenu() {
  selectWorkspaceMenu.value = false;
}

function handleSelectWorkspace(workspace: Workspace) {
  workspaceStore.setSelectedWorkspace(workspace);
  closeSelectWorkspaceMenu();
}

async function getWorkspaces() {
  workspaces.value = await workspacesService.getWorkspaces({
    workspaceType: WorkspaceTypes.PROJECT_MANAGEMENT,
  });

  if (workspaces.value.total > 0 && !selectedWorkspace.value) {
    handleSelectWorkspace(workspaces.value.workspaces[0]);
  }
}

onMounted(async () => {
  await getWorkspaces();
});
</script>

<template>
  <div class="d-flex justify-center align-center mt-2 px-2">
    <v-card
      density="compact"
      link
      id="workspace-menu-activator"
      class="flex-1-0 me-2"
    >
      <v-card-title class="d-flex align-center text-body-2 font-weight-bold">
        <span class="text-truncate mr-2">{{ selectedWorkspace?.name }}</span>
        <v-spacer />
        <v-icon>{{
          selectWorkspaceMenu ? 'mdi-chevron-up' : 'mdi-chevron-down'
        }}</v-icon>
      </v-card-title>
    </v-card>

    <v-btn
      id="workspace-menu-btn"
      variant="text"
      color="default"
      density="compact"
      icon="mdi-dots-vertical"
      rounded="md"
      size="small"
      @click.stop
    />

    <v-menu activator="#workspace-menu-btn" :close-on-content-click="false">
      <v-card class="pt-3 mt-2" width="300px" density="compact">
        <div class="px-5 text-truncate mb-2">
          <v-icon size="small">mdi-sitemap</v-icon>
          <span class="ml-1">
            {{ selectedWorkspace?.name }}
          </span>
        </div>
      </v-card>
    </v-menu>
  </div>

  <v-menu
    v-model="selectWorkspaceMenu"
    :close-on-content-click="false"
    activator="#workspace-menu-activator"
  >
    <v-card class="pt-3 mt-2" width="300px" density="compact">
      <div class="px-5 text-truncate mb-2">
        <v-icon size="small">mdi-sitemap</v-icon>
        <span class="ml-1"> Your workspaces </span>
      </div>
      <v-list density="compact" nav class="px-3" :lines="false">
        <v-list-item
          v-for="workspace in workspaces?.workspaces"
          :key="workspace.id"
          @click="handleSelectWorkspace(workspace)"
          :active="selectedWorkspace?.id === workspace.id"
        >
          <v-list-item-title>{{ workspace.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider class="mt-2" />
      <v-card-actions>
        <create-workspace-dialog-and-button @create="getWorkspaces()" />
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
