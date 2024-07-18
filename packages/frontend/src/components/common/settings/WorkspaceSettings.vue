<script setup lang="ts">
import { useWorkspacesService } from '@/composables/services/useWorkspacesService';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import type { VForm } from 'vuetify/components';

const { workspace } = storeToRefs(useAuthStore());
const selectedWorkspaceCopy = ref(cloneDeep(workspace.value));
const workspaceForm = ref<VForm>();
const workspacesService = useWorkspacesService();
const updateWorkspaceMutation = workspacesService.useUpdateWorkspaceMutation();
const isWorkspaceFormDisabled = computed(() =>
  objectUtils.isEqual(workspace.value!, selectedWorkspaceCopy.value!)
);

const snackbar = useSnackbarStore();

async function saveWorkspace() {
  const isValid = await workspaceForm.value?.validate();

  if (!isValid?.valid) {
    return;
  }

  updateWorkspaceMutation.mutateAsync(selectedWorkspaceCopy.value!).then(() => {
    snackbar.showSnackbar({
      message: 'Workspace updated.',
      color: 'success',
      timeout: 2000,
    });
  });
}
</script>

<template>
  <div id="workspace-settings-container" class="user-select-none">
    <h3>Workspace</h3>
    <p class="text-subtitle-2 mb-2">Update your current workspace.</p>

    <!-- TODO: Style -->
    <v-form
      ref="workspaceForm"
      id="workspace-form"
      @submit.prevent="saveWorkspace"
    >
      <v-text-field
        v-model="selectedWorkspaceCopy!.name"
        label="Name"
        hide-details
        variant="filled"
      />
      <div class="d-flex justify-end">
        <v-btn
          variant="flat"
          class="mt-4"
          type="submit"
          :disabled="isWorkspaceFormDisabled"
        >
          Save
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<style lang="scss">
#workspace-settings-container {
  width: 320px;
}
</style>
