<script setup lang="ts">
import { useListsService } from '@/composables/services/useListsService';
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import type { List } from '@/components/project-management/lists/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';
import { useCardTypesService } from '@/composables/services/useCardTypesService';
import { useWorkspaceStore } from '@/stores/workspace';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';

const listsService = useListsService();
const dialog = useDialogStore();
const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();
const { useFindAllQuery } = useCardTypesService();
const { selectedWorkspace } = storeToRefs(useWorkspaceStore());

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CREATE_LIST)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

const listForm = ref<VForm>();
const listDto = ref<Partial<List>>({
  name: '',
  spaceId: currentDialog.value?.data.space.id,
});

const { data: cardTypes } = useFindAllQuery({
  workspaceId: selectedWorkspace.value!.id,
});

const { mutateAsync: createList, isPending } =
  listsService.useCreateListMutation();

async function handleCreate() {
  const isValid = await listForm.value?.validate();
  if (isValid?.valid) {
    createList(listDto.value)
      .then(() => {
        dialog.closeDialog(currentDialogIndex.value);
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
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
        >Create list in {{ currentDialog?.data.space.name }}</v-card-subtitle
      >
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog(currentDialogIndex)"
      />
    </div>
    <v-form ref="listForm" @submit.prevent="handleCreate" validate-on="submit">
      <div class="pa-4 py-0">
        <v-text-field
          v-model="listDto.name"
          :rules="[rules.required]"
          label="Name*"
          autofocus
        />
        <v-autocomplete
          v-model="listDto.defaultCardType"
          :items="cardTypes"
          item-title="name"
          return-object
          :rules="[rules.required]"
          label="Default Card Type*   "
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
