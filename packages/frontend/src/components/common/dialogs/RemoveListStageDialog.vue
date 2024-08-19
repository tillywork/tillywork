<template>
  <v-card color="surface" elevation="24" :loading="isDeleting">
    <v-card-item>
      <v-card-title class="d-flex align-start">
        Delete list stage
        <v-spacer />
        <base-icon-btn
          icon="mdi-close"
          color="default"
          @click="dialog.closeDialog(currentDialogIndex)"
        />
      </v-card-title>
      <p class="text-color-subtitle text-body-3 mt-4">
        This will reassign all cards in list stage
        <span class="font-weight-bold">{{ listStage.name }}</span> to
        <span class="font-weight-bold">{{ replacementListStage?.name }}</span
        >. Are you sure you want to do this?
      </p>
    </v-card-item>
    <v-form
      ref="removeListStageForm"
      @submit.prevent="handleSubmitForm"
      validate-on="submit"
    >
      <div class="pa-4 py-0">
        <v-autocomplete
          :items="replacementOptions"
          item-title="name"
          :label="`Replace ${listStage.name} with*`"
          v-model="replacementListStage"
          return-object
          :rules="[rules.required]"
          density="comfortable"
        />
      </div>
      <v-card-actions class="d-flex justify-start align-center py-0 px-4">
        <v-spacer />

        <v-btn
          density="comfortable"
          variant="flat"
          type="submit"
          :loading="isDeleting"
          class="text-caption px-4 ms-4"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import { useSnackbarStore } from '@/stores/snackbar';

import { DIALOGS } from './types';
import { useDialogStore } from '@/stores/dialog';

import { useQueryClient } from '@tanstack/vue-query';
import type { ListStage } from '@/components/project-management/lists/types';
import { useListStagesService } from '@/services/useListStagesService';

const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();

// Dialog
const dialog = useDialogStore();
const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.REMOVE_LIST_STAGE)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);
const listStage = computed<ListStage>(() => currentDialog.value.data.listStage);
const replacementOptions = computed<ListStage[]>(() =>
  currentDialog.value.data.listStages.filter(
    (ls: ListStage) => ls.id !== listStage.value.id
  )
);

// Core
const queryClient = useQueryClient();
const { useDeleteListStageMutation } = useListStagesService();
const { mutateAsync: deleteListStage, isPending: isDeleting } =
  useDeleteListStageMutation();

const removeListStageForm = ref<VForm>();
const replacementListStage = ref<ListStage | undefined>(
  replacementOptions.value ? replacementOptions.value[0] : undefined
);

async function handleSubmitForm() {
  const isValid = await removeListStageForm.value?.validate();
  if (!isValid?.valid) return;

  try {
    await deleteListStage({
      listStage: {
        listId: listStage.value.listId,
        id: listStage.value.id,
      },
      replacementListStage: replacementListStage.value!,
    });
    dialog.closeDialog(currentDialogIndex.value);
    queryClient.invalidateQueries({ queryKey: ['listGroups'] });
    queryClient.invalidateQueries({ queryKey: ['cards'] });
  } catch (err) {
    showSnackbar({
      message: 'Something went wrong, please try again.',
      color: 'error',
      timeout: 5000,
    });
  }
}
</script>
