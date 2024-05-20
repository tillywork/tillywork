<script setup lang="ts">
import { useListsService } from '@/composables/services/useListsService';
import { useDialog } from '@/composables/useDialog';
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import type { List } from '@/components/project-management/lists/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';

const listsService = useListsService();
const dialog = useDialog();
const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();

const listForm = ref<VForm>();
const listDto = ref<Partial<List>>({
  name: '',
  spaceId: dialog.data.space.id,
});

const { mutateAsync: createList, isPending } =
  listsService.useCreateListMutation();

async function handleCreate() {
  const isValid = await listForm.value?.validate();
  if (isValid?.valid) {
    createList(listDto.value)
      .then(() => {
        dialog.closeDialog();
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
        >Create list in {{ dialog.data.space.name }}</v-card-subtitle
      >
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog()"
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
