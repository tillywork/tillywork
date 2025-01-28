<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';

const dialog = useDialogStore();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

function handleCancelClick() {
  if ('onCancel' in currentDialog.value.data) {
    currentDialog.value.data.onCancel();
  } else {
    dialog.closeDialog(currentDialogIndex.value);
  }
}
</script>

<template>
  <v-card color="dialog" elevation="12" border="thin">
    <v-card-title class="text-body-1 pa-4 pb-1">
      {{ currentDialog?.data.title ?? 'Confirm' }}
    </v-card-title>
    <v-card-text class="text-body-3 pa-4">
      {{ currentDialog?.data.message }}
    </v-card-text>
    <v-card-actions class="text-body-3">
      <v-btn
        color="error"
        @click="handleCancelClick"
        :disabled="currentDialog?.data.isLoading"
        class="text-none"
        >Cancel</v-btn
      >
      <v-btn
        color="info"
        @click="currentDialog?.data.onConfirm"
        :loading="currentDialog?.data.isLoading"
        class="text-none"
        >Confirm</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
