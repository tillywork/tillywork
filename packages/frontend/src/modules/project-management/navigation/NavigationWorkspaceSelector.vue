<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { WorkspaceTypes, type Workspace } from '../workspaces/types';
import { WorkspacesService, type WorkspacesData } from '../workspaces/workspaces.service';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';

const workspacesService = new WorkspacesService();
const workspaces = ref<WorkspacesData>();
const workspaceMenu = ref(false);
const workspaceStore = useWorkspaceStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);

function closeWorkspaceMenu() {
  workspaceMenu.value = false;
}

function handleSelectWorkspace(workspace: Workspace) {
  workspaceStore.setSelectedWorkspace(workspace);
  closeWorkspaceMenu();
}

onMounted(async () => {
  workspaces.value = await workspacesService.getWorkspaces({
    workspaceType: WorkspaceTypes.PROJECT_MANAGEMENT
  });

  if (workspaces.value.total > 0 && !selectedWorkspace.value) {
    handleSelectWorkspace(workspaces.value.workspaces[0]);
  }
});
</script>

<template>
  <v-card density="compact" link id="workspace-menu-activator" color="background" class="mx-2 mt-2">
    <v-card-title class="d-flex align-center text-body-2 font-weight-bold">
      <span class="text-truncate mr-2">{{ selectedWorkspace?.name }}</span>
      <v-spacer />
      <v-icon>{{ workspaceMenu ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </v-card-title>
  </v-card>

  <v-menu v-model="workspaceMenu" :close-on-content-click="false" activator="#workspace-menu-activator">
    <v-card class="pt-3 mt-2" width="300px" density="compact">
      <div class="px-5 text-truncate mb-2">
        <v-icon size="small">mdi-sitemap</v-icon>
        <span class="ml-1">
          Your workspaces
        </span>
      </div>
      <v-list density="compact" nav class="px-3" :lines="false">
        <v-list-item v-for="workspace in workspaces?.workspaces" :key="workspace.id"
          @click="handleSelectWorkspace(workspace)" :active="selectedWorkspace?.id === workspace.id">
          <v-list-item-title>{{ workspace.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider class="mt-2" />
      <v-card-actions>
        <v-btn color="default" density="compact" variant="text" rounded="xl">
          <v-icon>mdi-plus</v-icon>
          <span class="text-capitalize text-caption">New workspace</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
