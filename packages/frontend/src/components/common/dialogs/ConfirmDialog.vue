<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog';

const dialog = useDialogStore();
</script>

<template>
  <v-card color="accent" class="border-thin">
    <v-card-title class="text-body-1 pa-4 pb-1 bg-accent">{{
      dialog.dialogData.title
    }}</v-card-title>
    <v-card-text class="text-body-2 pa-4">{{
      dialog.dialogData.message
    }}</v-card-text>
    <v-card-actions class="text-body-2">
      <v-btn
        color="error"
        class="text-body-2"
        size="small"
        @click="dialog.dialogData.onCancel"
        :disabled="dialog.dialogData.isLoading"
        >Cancel</v-btn
      >
      <v-btn
        color="info"
        class="text-body-2"
        size="small"
        @click="dialog.dialogData.onConfirm"
        :loading="dialog.dialogData.isLoading"
        >Confirm</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
