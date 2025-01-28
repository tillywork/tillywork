<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';
import { useStateStore } from '@/stores/state';

const dialogStore = useDialogStore();
const { width: windowWidth, height: windowHeight } = useWindowSize();
const { setIsInputFocused } = useStateStore();

const dialogComponents = {
  [DIALOGS.CONFIRM]: () => import('./ConfirmDialog.vue'),
  [DIALOGS.CREATE_CARD]: () =>
    import('./CreateCardDialog/CreateCardDialog.vue'),
  [DIALOGS.UPSERT_SPACE]: () => import('./UpsertSpaceDialog.vue'),
  [DIALOGS.UPSERT_LIST]: () => import('./UpsertListDialog.vue'),
  [DIALOGS.UPSERT_LIST_STAGE]: () => import('./UpsertListStageDialog.vue'),
  [DIALOGS.REMOVE_LIST_STAGE]: () => import('./RemoveListStageDialog.vue'),
  [DIALOGS.UPSERT_VIEW]: () => import('./UpsertViewDialog.vue'),
  [DIALOGS.CREATE_WORKSPACE]: () => import('./CreateWorkspaceDialog.vue'),
  [DIALOGS.ONBOARDING]: () => import('./OnboardingDialog.vue'),
  [DIALOGS.CREATE_CARD_TYPE]: () => import('./CreateCardTypeDialog.vue'),
  [DIALOGS.REMOVE_CARD_TYPE]: () => import('./RemoveCardTypeDialog.vue'),
  [DIALOGS.EDIT_LIST_STAGES]: () => import('./EditListStagesDialog.vue'),
};

const currentDialogs = computed(() => {
  return dialogStore.dialogs.map((dialog) => {
    return {
      component: dialog.dialog ? lazyLoadDialog(dialog.dialog) : null,
      options: dialog.options,
    };
  });
});

/**
 * Component cache to prevent re-rendering of
 * opened dialogs when currentDialogs changes
 */
const loadedComponents = new Map<DIALOGS, any>();

function lazyLoadDialog(dialog: DIALOGS) {
  if (!loadedComponents.has(dialog)) {
    loadedComponents.set(
      dialog,
      defineAsyncComponent(dialogComponents[dialog])
    );
  }
  return loadedComponents.get(dialog);
}

function handleAfterLeave(index: number) {
  dialogStore.closeDialog(index);
  // Reset input focus
  setIsInputFocused(false);
}
</script>

<template>
  <template
    v-for="(dialog, index) in currentDialogs"
    :key="dialog.component.name"
  >
    <v-dialog
      :model-value="true"
      :scrim="false"
      :width="
        dialog.options?.fullscreen ? undefined : dialog.options?.width ?? 750
      "
      :location-strategy="dialog.options?.fullscreen ? undefined : 'connected'"
      :target="
        dialog.options?.fullscreen
          ? undefined
          : [windowWidth / 2, windowHeight / 3.5]
      "
      :fullscreen="dialog.options?.fullscreen"
      :persistent="dialog.options?.persistent"
      @after-leave="handleAfterLeave(index)"
      content-class="base-dialog"
    >
      <component :is="dialog.component" />
    </v-dialog>
  </template>
</template>



<style scoped lang="scss">
:deep(.base-dialog) {
  position: fixed !important;
  top: 80px !important;
  margin-top: 0 !important;
}
</style>