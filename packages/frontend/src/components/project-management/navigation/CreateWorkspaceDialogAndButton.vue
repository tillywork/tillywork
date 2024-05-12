<script setup lang="ts">
import { ref } from 'vue';
import { useWorkspacesService } from '@/composables/services/useWorkspacesService';
import { useWorkspaceStore } from '@/stores/workspace';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { validation } from '@/utils/validation';
import { VForm } from 'vuetify/lib/components/index.mjs';
import { WorkspaceTypes } from '../workspaces/types';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const workspaceStore = useWorkspaceStore();
const authStore = useAuthStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);
const { user } = storeToRefs(authStore);
const workspacesService = useWorkspacesService();
const createWorkspaceDialog = ref(false);
const createWorkspaceForm = ref<null | VForm>(null);
const createWorkspaceData = ref({
  name: '',
  ownerId: user.value.id,
  projectId: selectedWorkspace.value?.projectId,
  workspaceType: WorkspaceTypes.PROJECT_MANAGEMENT,
});

const queryClient = useQueryClient();
const createWorkspaceMutation = useMutation({
  mutationFn: createWorkspace,
  onSuccess: () => {
    createWorkspaceForm.value?.reset();
    closeCreateWorkspaceDialog();
    queryClient.invalidateQueries({ queryKey: ['workspaces'] });
  },
});

function closeCreateWorkspaceDialog() {
  createWorkspaceDialog.value = false;
}

async function createWorkspace() {
  if (!createWorkspaceForm.value?.isValid) throw new Error();

  const workspace = await workspacesService.createWorkspace(
    createWorkspaceData.value
  );

  return workspace;
}
</script>

<template>
  <v-btn
    id="create-workspace-button"
    color="default"
    density="compact"
    variant="text"
    rounded="xl"
  >
    <v-icon>mdi-plus</v-icon>
    <span class="text-capitalize text-caption">New workspace</span>
  </v-btn>

  <v-dialog
    v-model="createWorkspaceDialog"
    activator="#create-workspace-button"
    width="400"
  >
    <template v-slot:default>
      <v-form
        ref="createWorkspaceForm"
        @submit.prevent="createWorkspaceMutation.mutate"
      >
        <v-card :loading="createWorkspaceMutation.isPending.value">
          <template v-slot:loader="{ isActive }">
            <v-progress-linear
              :active="isActive"
              color="primary"
              height="4"
              indeterminate
            ></v-progress-linear>
          </template>
          <v-card-title class="text-body-2 font-weight-medium"
            >Create Workspace</v-card-title
          >
          <v-divider />
          <v-card-text>
            <v-text-field
              v-model="createWorkspaceData.name"
              prepend-inner-icon="mdi-file-cabinet"
              single-line
              label="Workspace Name"
              :rules="[validation.rules.required]"
            />
            <v-select
              v-model="createWorkspaceData.workspaceType"
              prepend-inner-icon="mdi-filter-variant"
              density="compact"
              label="Workspace Type"
              single-line
              :items="Object.values(WorkspaceTypes)"
            />
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="default"
              @click="closeCreateWorkspaceDialog()"
              :disabled="createWorkspaceMutation.isPending.value"
              rounded="xl"
              class="text-capitalize"
              >Cancel</v-btn
            >
            <v-btn
              variant="flat"
              :disabled="createWorkspaceMutation.isPending.value"
              type="submit"
              rounded="xl"
              class="text-capitalize"
              >Create</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
    </template>
  </v-dialog>
</template>
