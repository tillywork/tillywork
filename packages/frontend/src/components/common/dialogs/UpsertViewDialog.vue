<script setup lang="ts">
import { useViewsService } from '@/services/useViewsService';
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import {
  ViewTypes,
  type View,
} from '@/components/project-management/views/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS, UpsertDialogMode } from './types';

const viewsService = useViewsService();
const dialog = useDialogStore();
const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.UPSERT_VIEW)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);
const view = computed<View>(() => currentDialog.value.data.view);

const viewForm = ref<VForm>();
const viewDto = ref<Partial<View>>({
  name: view.value?.name,
  type: view.value?.type,
  listId: view.value?.listId ?? currentDialog.value?.data.list.id,
});

const viewTypeOptions = ref([
  {
    title: 'Table',
    value: ViewTypes.TABLE,
    icon: 'mdi-table',
  },
  {
    title: 'Board',
    value: ViewTypes.BOARD,
    icon: 'mdi-view-column',
  },
  {
    title: 'List',
    value: ViewTypes.LIST,
    icon: 'mdi-list-box-outline',
  },
]);

const { mutateAsync: createView, isPending: isCreating } =
  viewsService.useCreateViewMutation();
const { mutateAsync: updateView, isPending: isUpdating } =
  viewsService.useUpdateViewMutation();

async function handleCreate() {
  const isValid = await viewForm.value?.validate();
  if (!isValid?.valid) return;

  try {
    switch (currentDialog.value.data.mode) {
      case UpsertDialogMode.CREATE:
        await createView(viewDto.value);
        break;

      case UpsertDialogMode.UPDATE: {
        await updateView({
          ...view.value,
          ...viewDto.value,
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
        view
      </v-card-subtitle>
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog(currentDialogIndex)"
      />
    </div>
    <v-form ref="viewForm" @submit.prevent="handleCreate" validate-on="submit">
      <div class="pa-4 py-0">
        <v-text-field
          v-model="viewDto.name"
          :rules="[rules.required]"
          label="Name*"
          autofocus
        />
        <v-select
          v-model="viewDto.type"
          label="Type*"
          :items="viewTypeOptions"
          :rules="[rules.required]"
        >
          <template #item="{ item, props }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon :icon="item.raw.icon" />
              </template>
            </v-list-item>
          </template>
          <template #selection="{ item }">
            <span class="d-flex align-center ga-3 text-body-3">
              <v-icon :icon="item.raw.icon" />
              {{ item.title }}
            </span>
          </template>
        </v-select>
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
