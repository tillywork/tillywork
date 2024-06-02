<script setup lang="ts">
import { useViewsService } from '@/composables/services/useViewsService';
import { useDialog } from '@/composables/useDialog';
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import {
  ViewTypes,
  type View,
} from '@/components/project-management/views/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';

const viewsService = useViewsService();
const dialog = useDialog();
const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();

const viewForm = ref<VForm>();
const viewDto = ref<Partial<View>>({
  name: '',
  listId: dialog.data.list.id,
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

const { mutateAsync: createView, isPending } =
  viewsService.useCreateViewMutation();

async function handleCreate() {
  const isValid = await viewForm.value?.validate();
  if (isValid?.valid) {
    createView(viewDto.value)
      .then(() => {
        dialog.closeDialog();
        queryClient.invalidateQueries({
          queryKey: ['list', dialog.data.list.id],
        });
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
      <v-card-subtitle>
        Create view in {{ dialog.data.list.name }}
      </v-card-subtitle>
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog()"
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
          density="compact"
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
            <span class="d-flex align-center ga-3 text-body-2">
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
          :loading="isPending"
          >Create</v-btn
        >
      </v-card-actions>
    </v-form>
  </v-card>
</template>
