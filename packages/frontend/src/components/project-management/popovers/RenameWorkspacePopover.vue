<script setup lang="ts">
import { useWorkspacesService } from '@/composables/services/useWorkspacesService';
import type { Workspace } from '../workspaces/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { cloneDeep } from 'lodash';

const props = defineProps<{
  workspace: Workspace;
}>();
const workspaceCopy = cloneDeep(props.workspace);
const workspacesService = useWorkspacesService();
const updateWorkspaceMutation = workspacesService.useUpdateWorkspaceMutation();

const snackbar = useSnackbarStore();

const popover = ref(false);
const emit = defineEmits(['hover:freeze', 'hover:unfreeze']);

const workspaceName = ref(props.workspace.name);

function handleRenameWorkspacePopoverClick() {
  popover.value = !popover.value;
  emit('hover:freeze');
}

function handleKeyEnter() {
  const newName = workspaceName.value.trim();
  if (newName !== '' && newName !== props.workspace.name) {
    workspaceCopy.name = newName;
    updateWorkspaceMutation.mutateAsync(workspaceCopy).then(() => {
      snackbar.showSnackbar({
        message: 'Workspace name updated.',
        color: 'success',
        timeout: 2000,
      });
    });
  }
}

watch(popover, () => {
  if (!popover.value) {
    emit('hover:unfreeze');
  }
});
</script>

<template>
  <base-icon-btn
    id="rename-workspace-popover-btn"
    icon="mdi-rename-outline"
    density="compact"
    @click.stop="handleRenameWorkspacePopoverClick"
  />

  <v-menu
    v-model="popover"
    target="#rename-workspace-popover-btn"
    :width="250"
    :close-on-content-click="false"
  >
    <v-card>
      <v-text-field
        v-model="workspaceName"
        autofocus
        single-line
        hide-details
        variant="filled"
        @keydown.enter="handleKeyEnter"
      />
      <v-card-subtitle
        class="user-select-none"
        @click="handleRenameWorkspacePopoverClick"
      >
        Press Enter to Rename
      </v-card-subtitle>
    </v-card>
  </v-menu>
</template>
