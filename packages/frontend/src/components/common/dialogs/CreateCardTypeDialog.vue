<script setup lang="ts">
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';
import { useCardTypesService } from '@/services/useCardTypesService';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';
import { useAuthStore } from '@/stores/auth';
import type { CreateCardTypeDto } from '@tillywork/shared';

const { rules } = validationUtils;
const dialog = useDialogStore();
const queryClient = useQueryClient();
const { showSnackbar } = useSnackbarStore();
const { useCreateMutation } = useCardTypesService();
const { workspace } = storeToRefs(useAuthStore());

const cardTypeForm = ref<VForm>();
const cardTypeDto = ref<CreateCardTypeDto>({
  name: '',
  workspaceId: workspace.value!.id,
});

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CREATE_CARD_TYPE)
);

const { mutateAsync: createCardType, isPending } = useCreateMutation();

async function handleCreate() {
  const isValid = await cardTypeForm.value?.validate();
  if (isValid?.valid) {
    createCardType(cardTypeDto.value)
      .then(() => {
        dialog.closeDialog(currentDialogIndex.value);
        queryClient.invalidateQueries({
          queryKey: [
            'cardTypes',
            {
              workspaceId: workspace.value?.id,
            },
          ],
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
  <v-card color="dialog" elevation="12" border="thin" :loading="isPending">
    <div class="d-flex align-center ps-0 pa-4">
      <v-card-subtitle>Create card type</v-card-subtitle>
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog(currentDialogIndex)"
      />
    </div>
    <v-form
      ref="cardTypeForm"
      @submit.prevent="handleCreate"
      validate-on="submit"
    >
      <div class="pa-4 py-0">
        <v-text-field
          v-model="cardTypeDto.name"
          :rules="[rules.required]"
          label="Name*"
          autofocus
        />
        <v-checkbox v-model="cardTypeDto.hasChildren" label="Has children" />
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
