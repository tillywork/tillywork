<script setup lang="ts">
import { useWorkspacesService } from '@/composables/services/useWorkspacesService';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import validationUtils from '@/utils/validation';
import { cloneDeep } from 'lodash';
import type { VForm } from 'vuetify/components';
import BaseSlugInput from '@/components/common/inputs/BaseSlugInput.vue';

const { workspace } = storeToRefs(useAuthStore());
const selectedWorkspaceCopy = ref(cloneDeep(workspace.value));
const workspaceForm = ref<VForm>();
const workspacesService = useWorkspacesService();
const updateWorkspaceMutation = workspacesService.useUpdateWorkspaceMutation();
const isWorkspaceFormDisabled = computed(() =>
  objectUtils.isEqual(workspace.value!, selectedWorkspaceCopy.value!)
);

const snackbar = useSnackbarStore();

const { rules } = validationUtils;
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
  <v-card class="pa-4" height="100%">
    <h3>Workspace</h3>
    <p class="text-subtitle-2 mb-4">Update your current workspace.</p>

    <v-divider class="my-6" />

    <v-card width="300">
      <v-form
        ref="workspaceForm"
        id="workspace-form"
        @submit.prevent="saveWorkspace"
      >
        <v-text-field
          v-model="selectedWorkspaceCopy!.name"
          label="Name*"
          hide-details
          variant="filled"
          :rules="[rules.required]"
        />
        <base-slug-input
          v-model="selectedWorkspaceCopy!.slug"
          auto
          :dependent="selectedWorkspaceCopy!.name"
          :props="{
            label: 'Slug*',
            hideDetails: true,
            variant: 'filled',
            rules: [rules.required, rules.slug],
          }"
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
    </v-card>
  </v-card>
</template>
