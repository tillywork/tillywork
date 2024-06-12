<script setup lang="ts">
import { useSpacesService } from '@/composables/services/useSpacesService';
import { useWorkspaceStore } from '@/stores/workspace';
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import type { Space } from '@/components/project-management/spaces/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';

const workspaceStore = useWorkspaceStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);
const spacesService = useSpacesService();
const dialog = useDialogStore();
const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CREATE_SPACE)
);

const spaceForm = ref<VForm>();
const spaceDto = ref<Partial<Space>>({
  name: '',
  workspaceId: selectedWorkspace.value?.id,
});

const { mutateAsync: createSpace, isPending } =
  spacesService.useCreateSpaceMutation();

async function handleCreate() {
  const isValid = await spaceForm.value?.validate();
  if (isValid?.valid) {
    createSpace(spaceDto.value)
      .then(() => {
        dialog.closeDialog(currentDialogIndex.value);
      })
      .catch(() => {
        showSnackbar({
          message: 'Something went wrong, please try again.',
          color: 'error',
          timeout: 5000,
        });
      });
  }
}
</script>

<template>
  <v-card color="surface" elevation="24" :loading="isPending">
    <div class="d-flex align-center ps-0 pa-4">
      <v-card-subtitle
        >Create space in {{ selectedWorkspace?.name }}</v-card-subtitle
      >
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog(currentDialogIndex)"
      />
    </div>
    <v-form ref="spaceForm" @submit.prevent="handleCreate" validate-on="submit">
      <div class="pa-4 py-0">
        <v-text-field
          v-model="spaceDto.name"
          :rules="[rules.required]"
          label="Name*"
          autofocus
        />
      </div>
      <v-card-actions class="d-flex justify-start align-center py-0 px-4">
        <v-spacer />

        <v-btn
          density="comfortable"
          variant="flat"
          class="text-caption px-4 ms-4"
          type="submit"
          :loading="isPending"
          >Create</v-btn
        >
      </v-card-actions>
    </v-form>
  </v-card>
</template>
