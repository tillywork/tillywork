<script setup lang="ts">
import { computed } from 'vue';
import { defineAsyncComponent } from 'vue';
import { useDialogStore } from '@/stores/dialog';
import { storeToRefs } from 'pinia';
import { useWindowSize } from '@vueuse/core';
import { DIALOGS } from './types';

const dialogStore = useDialogStore();
const { currentDialog } = storeToRefs(dialogStore);
const { width, height } = useWindowSize();

const isDialogOpen = computed({
  get: () => currentDialog.value !== null,
  set: (val) => {
    if (!val) currentDialog.value = null;
  },
});

const dialogComponents = {
  [DIALOGS.CONFIRM]: () => import('./ConfirmDialog.vue'),
  [DIALOGS.CREATE_CARD]: () => import('./CreateCardDialog.vue'),
};

const currentDialogComponent = computed(() => {
  if (!currentDialog.value) return null;

  return lazyLoadDialog(currentDialog.value);
});

function lazyLoadDialog(dialog: DIALOGS) {
  return defineAsyncComponent(dialogComponents[dialog]);
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
