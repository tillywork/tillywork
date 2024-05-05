<script setup lang="ts">
import { ref } from 'vue';
import { WorkspaceTypes, type Workspace } from '../workspaces/types';
import { useWorkspacesService } from '@/composables/services/useWorkspacesService';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';
import CreateWorkspaceDialogAndButton from './CreateWorkspaceDialogAndButton.vue';
import { useQuery } from '@tanstack/vue-query';
import BaseAvatar from '@/components/common/base/BaseAvatar.vue';

const workspacesService = useWorkspacesService();
const selectWorkspaceMenu = ref(false);
const workspaceStore = useWorkspaceStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);
const workspaceQuery = useQuery({
  queryKey: ['workspaces'],
  queryFn: getWorkspaces,
  refetchOnWindowFocus: false,
});

function closeSelectWorkspaceMenu() {
  selectWorkspaceMenu.value = false;
}

function handleSelectWorkspace(workspace: Workspace) {
  workspaceStore.setSelectedWorkspace(workspace);
  closeSelectWorkspaceMenu();
}

async function getWorkspaces() {
  const workspaces = await workspacesService.getWorkspaces({
    workspaceType: WorkspaceTypes.PROJECT_MANAGEMENT,
  });

  if (workspaces.total > 0 && !selectedWorkspace.value) {
    handleSelectWorkspace(workspaces.workspaces[0]);
  }

  return workspaces;
}
</script>

<template>
  <div class="d-flex justify-start align-center mt-4 px-2">
    <v-card
      density="compact"
      link
      id="workspace-menu-activator"
      class="me-2 user-select-none"
      rounded="md"
    >
      <v-card-title
        class="d-flex align-center text-body-1 font-weight-medium pa-2px py-1 ps-2"
      >
        <base-avatar
          :text="selectedWorkspace?.name"
          color="rgb(116, 140, 7)"
          size="24"
          rounded="sm"
          class="text-caption"
        />
        <span class="text-truncate mx-2">{{ selectedWorkspace?.name }}</span>
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
      <v-card color="menu" class="pt-3 mt-2" width="300px" density="compact">
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
    <v-card color="menu" class="pt-3 mt-2" width="300px" density="compact">
      <div class="px-5 text-truncate mb-2">
        <v-icon size="small">mdi-sitemap</v-icon>
        <span class="ml-1"> Your workspaces </span>
      </div>
      <v-list density="compact" nav class="bg-menu px-3" :lines="false">
        <v-list-item
          v-for="workspace in workspaceQuery.data.value?.workspaces"
          :key="workspace.id"
          @click="handleSelectWorkspace(workspace)"
          :active="selectedWorkspace?.id === workspace.id"
        >
          <v-list-item-title class="d-flex align-center user-select-none">
            <base-avatar
              :text="workspace.name"
              color="rgb(116, 140, 7)"
              size="22"
              rounded="sm"
              class="text-caption me-2"
            />
            <span>{{ workspace.name }}</span>
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider class="mt-2" />
      <v-card-actions>
        <create-workspace-dialog-and-button />
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
