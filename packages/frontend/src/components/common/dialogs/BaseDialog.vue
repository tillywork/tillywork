<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';

const dialogStore = useDialogStore();
const { currentDialog, options } = storeToRefs(dialogStore);
const { width: windowWidth, height: windowHeight } = useWindowSize();

const isDialogOpen = computed({
  get: () => currentDialog.value !== null,
  set: (val) => {
    if (!val) currentDialog.value = null;
  },
});

const dialogComponents = {
  [DIALOGS.CONFIRM]: () => import('./ConfirmDialog.vue'),
  [DIALOGS.CREATE_CARD]: () => import('./CreateCardDialog.vue'),
  [DIALOGS.CREATE_SPACE]: () => import('./CreateSpaceDialog.vue'),
  [DIALOGS.CREATE_LIST]: () => import('./CreateListDialog.vue'),
  [DIALOGS.CREATE_VIEW]: () => import('./CreateViewDialog.vue'),
  [DIALOGS.CREATE_WORKSPACE]: () => import('./CreateWorkspaceDialog.vue'),
  [DIALOGS.ONBOARDING]: () => import('./OnboardingDialog.vue'),
  [DIALOGS.SETTINGS]: () => import('./SettingsDialog.vue'),
  [DIALOGS.CREATE_CARD_TYPE]: () => import('./CreateCardTypeDialog.vue'),
};

const currentDialogComponent = computed(() => {
  if (!currentDialog.value) return null;

  return lazyLoadDialog(currentDialog.value);
});

const width = computed(() => {
  return !options.value.fullscreen ? options.value.width ?? 750 : undefined;
});

const target = computed(() => {
  return !options.value.fullscreen
    ? ([windowWidth.value / 2, windowHeight.value / 3.5] as any)
    : undefined;
});

const locationStrategy = computed(() => {
  return !options.value.fullscreen ? 'connected' : undefined;
});

function lazyLoadDialog(dialog: DIALOGS) {
  return defineAsyncComponent(dialogComponents[dialog]);
}

function handleAfterLeave() {
  dialogStore.setData({});
  dialogStore.setOptions({});
}
</script>

<template>
  <v-dialog
    v-model="isDialogOpen"
    :width
    opacity="0.1"
    :location-strategy="locationStrategy"
    :target
    :fullscreen="options.fullscreen"
    :persistent="options.persistent"
    :key="currentDialogComponent?.name"
    @after-leave="handleAfterLeave"
  >
    <component :is="currentDialogComponent" />
  </v-dialog>
</template>
