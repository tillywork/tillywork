<script setup lang="ts">
import { computed } from 'vue';
import { defineAsyncComponent } from 'vue';
import { useDialogStore } from '@/stores/dialog';
import { storeToRefs } from 'pinia';
import { useWindowSize } from '@vueuse/core';

const DIALOG_PATH = '../dialogs';

const dialogStore = useDialogStore();
const { currentDialog } = storeToRefs(dialogStore);
const { width, height } = useWindowSize();

const isDialogOpen = computed({
  get: () => currentDialog.value !== null,
  set: (val) => {
    if (!val) currentDialog.value = null;
  },
});

const currentDialogComponent = computed(() => {
  if (!currentDialog.value) return null;

  return lazyLoadDialog(`${DIALOG_PATH}/${currentDialog.value}.vue`);
});

function lazyLoadDialog(path: string) {
  return defineAsyncComponent(() => import(/* @vite-ignore */ path));
}
</script>

<template>
  <v-dialog
    v-model="isDialogOpen"
    :width="dialogStore.width ?? 750"
    opacity="0.1"
    location-strategy="connected"
    :target="[width / 2, height / 3.5]"
  >
    <component :is="currentDialogComponent" />
  </v-dialog>
</template>
