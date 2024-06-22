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
  dialog.getDialogIndex(DIALOGS.UPSERT_LIST)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);
const list = computed<List>(() => currentDialog.value.data.list);

const listForm = ref<VForm>();
const listDto = ref<Partial<List>>({
  name: list.value?.name,
  // TODO: Allow to update space?
  spaceId: list.value?.spaceId ?? currentDialog.value?.data.space.id,
  defaultCardType: list.value?.defaultCardType,
});

const { data: cardTypes } = useFindAllQuery({
  workspaceId: selectedWorkspace.value!.id,
});

const { mutateAsync: createList, isPending: isCreating } =
  listsService.useCreateListMutation();
const { mutateAsync: updateList, isPending: isUpdating } =
  listsService.useUpdateListMutation();

async function handleSubmitForm() {
  const isValid = await listForm.value?.validate();
  if (!isValid?.valid) return;

  try {
    switch (currentDialog.value.data.mode) {
      case 'Create':
        createList(listDto.value).then(() => {
          dialog.closeDialog(currentDialogIndex.value);
          queryClient.invalidateQueries({ queryKey: ['spaces'] });
        });
        break;
      case 'Update':
        // - nothing has changed
        if (
          listDto.value.name === list.value.name &&
          listDto.value.defaultCardType === listDto.value.defaultCardType
        ) {
          dialog.closeDialog(currentDialogIndex.value);
          break;
        }

        updateList({
          id: list.value.id,
          updateDto: listDto.value,
        }).then(() => {
          dialog.closeDialog(currentDialogIndex.value);
          queryClient.invalidateQueries({ queryKey: ['spaces'] });
          showSnackbar({
            message: 'List updated.',
            color: 'success',
            timeout: 2000,
          });
        });
        break;
    }
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
        {{ currentDialog?.data.mode }}
        List
        {{
          currentDialog?.data.space ? 'in ' + currentDialog.data.space.name : ''
        }}
      </v-card-subtitle>
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog(currentDialogIndex)"
      />
    </div>
    <v-form
      ref="listForm"
      @submit.prevent="handleSubmitForm"
      validate-on="submit"
    >
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
          label="Default Card Type*"
        />
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
          {{ currentDialog?.data.mode }}
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
