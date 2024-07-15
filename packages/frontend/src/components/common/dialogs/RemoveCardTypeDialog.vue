<script setup lang="ts">
import { type VForm } from 'vuetify/components';
import validationUtils from '@/utils/validation';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';
import { useCardTypesService } from '@/composables/services/useCardTypesService';
import { type CardType } from '@/components/project-management/cards/types';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';
import { useAuthStore } from '@/stores/auth';

const { rules } = validationUtils;
const dialog = useDialogStore();
const queryClient = useQueryClient();
const { showSnackbar } = useSnackbarStore();
const { useRemoveMutation } = useCardTypesService();
const { workspace } = storeToRefs(useAuthStore());

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.REMOVE_CARD_TYPE)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

const cardType = computed<CardType>(() => currentDialog.value?.data.cardType);
const replacementOptions = computed(() =>
  workspace.value?.cardTypes.filter((ct) => ct.id !== cardType.value.id)
);

const removeCardTypeForm = ref<VForm>();
const replacementCardType = ref<CardType | undefined>(
  replacementOptions.value ? replacementOptions.value[0] : undefined
);

const { mutateAsync: removeCardType, isPending } = useRemoveMutation();

async function handleCreate() {
  const isValid = await removeCardTypeForm.value?.validate();
  if (isValid?.valid) {
    removeCardType({
      id: cardType.value.id,
      replacementCardType: replacementCardType.value!,
    })
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
  <v-card color="surface" elevation="24" :loading="isPending">
    <v-card-item>
      <v-card-title class="d-flex align-start">
        Delete card type
        <v-spacer />
        <base-icon-btn
          icon="mdi-close"
          color="default"
          @click="dialog.closeDialog(currentDialogIndex)"
        />
      </v-card-title>
      <p class="text-color-subtitle text-body-3 mt-4">
        This will reassign all cards with type
        <span class="font-weight-bold">{{ cardType.name }}</span> to
        <span class="font-weight-bold">{{ replacementCardType?.name }}</span
        >. Are you sure you want to do this?
      </p>
    </v-card-item>
    <v-form
      ref="removeCardTypeForm"
      @submit.prevent="handleCreate"
      validate-on="submit"
    >
      <div class="pa-4 py-0">
        <v-autocomplete
          :items="replacementOptions"
          item-title="name"
          :label="`Replace ${cardType.name} with*`"
          v-model="replacementCardType"
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
          class="text-caption px-4 ms-4"
          type="submit"
          :loading="isPending"
          >Delete</v-btn
        >
      </v-card-actions>
    </v-form>
  </v-card>
</template>
