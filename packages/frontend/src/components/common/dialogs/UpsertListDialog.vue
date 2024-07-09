<script setup lang="ts">
import { useListsService } from '@/composables/services/useListsService';
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import BaseIconSelector from '../../common/inputs/BaseIconSelector/BaseIconSelector.vue';
import type { List } from '@/components/project-management/lists/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';
import { useCardTypesService } from '@/composables/services/useCardTypesService';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS, UpsertDialogMode } from './types';
import { useAuthStore } from '@/stores/auth';

const listsService = useListsService();
const dialog = useDialogStore();
const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();
const { useFindAllQuery } = useCardTypesService();
const { workspace } = storeToRefs(useAuthStore());

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.UPSERT_LIST)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);
const list = computed<List>(() => currentDialog.value.data.list);

const listForm = ref<VForm>();
const listDto = ref<Partial<List>>({
  icon: list.value?.icon ?? 'mdi-list-box-outline',
  name: list.value?.name,
  spaceId: list.value?.spaceId ?? currentDialog.value?.data.space.id,
  defaultCardType:
    list.value?.defaultCardType ?? workspace.value?.defaultCardType,
});

const { data: cardTypes } = useFindAllQuery({
  workspaceId: workspace.value!.id,
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
      case UpsertDialogMode.CREATE:
        await createList(listDto.value);
        break;
      case UpsertDialogMode.UPDATE:
        await updateList({
          id: list.value.id,
          updateDto: listDto.value,
        });
        break;
    }

    queryClient.invalidateQueries({ queryKey: ['spaces'] });
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
        list
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
        >
          <template #prepend-inner>
            <base-icon-selector v-model="listDto.icon" />
          </template>
        </v-text-field>
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
