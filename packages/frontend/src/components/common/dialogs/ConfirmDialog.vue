<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';

const dialog = useDialogStore();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);
</script>

<template>
  <v-card color="accent" class="border-thin">
    <v-card-title class="text-body-1 pa-4 pb-1 bg-accent">
      {{ currentDialog?.data.title ?? 'Confirm' }}
    </v-card-title>
    <v-card-text class="text-body-3 pa-4">
      {{ currentDialog?.data.message }}
    </v-card-text>
    <v-card-actions class="text-body-3">
      <v-btn
        color="error"
        class="text-body-3"
        size="small"
        @click="currentDialog?.data.onCancel"
        :disabled="currentDialog?.data.isLoading"
        >Cancel</v-btn
      >
      <v-btn
        color="info"
        class="text-body-3"
        size="small"
        @click="currentDialog?.data.onConfirm"
        :loading="currentDialog?.data.isLoading"
        >Confirm</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
