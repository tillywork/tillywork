<script setup lang="ts">
import { useWorkspacesService } from '@/composables/services/useWorkspacesService';
import { useDialog } from '@/composables/useDialog';
import { type Workspace } from '@/components/project-management/workspaces/types';
import { useSnackbarStore } from '@/stores/snackbar';
import CreateWorkspaceForm from '@/components/project-management/workspaces/CreateWorkspaceForm.vue';

const workspacesService = useWorkspacesService();
const dialog = useDialog();
const { showSnackbar } = useSnackbarStore();

const { mutateAsync: createWorkspace, isPending } =
  workspacesService.useCreateWorkspaceMutation();

async function handleCreate(workspaceDto: Partial<Workspace>) {
  createWorkspace(workspaceDto)
    .then(() => {
      dialog.closeDialog();
    })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    });
}
</script>

<template>
  <v-card color="surface" elevation="24" :loading="isPending">
    <div class="d-flex align-center ps-0 pa-4">
      <v-card-subtitle class="text-h6">Create workspace</v-card-subtitle>
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog()"
      />
    </div>
    <create-workspace-form
      @submit="handleCreate"
      :loading="isPending"
      card-class="mt-16"
    />
  </v-card>
</template>
