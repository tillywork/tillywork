<script setup lang="ts">
import { useSpacesService } from '@/services/useSpacesService';
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import BaseIconSelector from '../../common/inputs/BaseIconSelector/BaseIconSelector.vue';
import type { Space } from '@/components/project-management/spaces/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS, UpsertDialogMode } from './types';
import { useAuthStore } from '@/stores/auth';

const { workspace } = storeToRefs(useAuthStore());
const spacesService = useSpacesService();
const dialog = useDialogStore();
const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.UPSERT_SPACE)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);
const space = computed<Space>(() => currentDialog.value.data.space);

const spaceForm = ref<VForm>();
const spaceDto = ref<Partial<Space>>({
  icon: space.value?.icon,
  iconColor: space.value?.iconColor,
  name: space.value?.name,
  workspaceId: workspace.value!.id,
});

const { mutateAsync: createSpace, isPending: isCreating } =
  spacesService.useCreateSpaceMutation();
const { mutateAsync: updateSpace, isPending: isUpdating } =
  spacesService.useUpdateSpaceMutation();

async function handleSubmitForm() {
  const isValid = await spaceForm.value?.validate();
  if (!isValid?.valid) return;

  try {
    switch (currentDialog.value.data.mode) {
      case UpsertDialogMode.CREATE:
        await createSpace(spaceDto.value);
        break;

      case UpsertDialogMode.UPDATE: {
        await updateSpace({
          ...space.value,
          ...spaceDto.value,
        });
        break;
      }
    }

    dialog.closeDialog(currentDialogIndex.value);
  } catch {
    showSnackbar({
      message: 'Something went wrong, please try again.',
      color: 'error',
      timeout: 5000,
    });
  }
}
</script>

<template>
  <v-card color="surface" elevation="24" :loading="isCreating || isUpdating">
    <div class="d-flex align-center ps-0 pa-4">
      <v-card-subtitle>
        <span class="text-capitalize">{{ currentDialog?.data.mode }}</span>
        space
      </v-card-subtitle>
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog(currentDialogIndex)"
      />
    </div>
    <v-form
      ref="spaceForm"
      @submit.prevent="handleSubmitForm"
      validate-on="submit"
    >
      <div class="pa-4 py-0">
        <v-text-field
          v-model="spaceDto.name"
          :rules="[rules.required]"
          label="Name*"
          autofocus
        >
          <template #prepend-inner>
            <base-icon-selector
              with-color
              v-model="spaceDto.icon"
              v-model:color="spaceDto.iconColor"
            />
          </template>
        </v-text-field>
      </div>
      <v-card-actions class="d-flex justify-start align-center py-0 px-4">
        <v-spacer />

        <v-btn
          density="comfortable"
          variant="flat"
          class="text-caption px-4 ms-4"
          type="submit"
          :loading="isCreating || isUpdating"
        >
          {{
            currentDialog?.data.mode === UpsertDialogMode.CREATE
              ? 'Create'
              : 'Save'
          }}
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
