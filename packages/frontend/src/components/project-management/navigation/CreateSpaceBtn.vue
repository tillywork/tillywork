<script setup lang="ts">
import { DIALOGS } from '@/components/common/dialogs/types';
import { useDialogStore } from '@/stores/dialog';

const dialog = useDialogStore();

function openCreateSpaceDialog() {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_SPACE,
    data: {
      // ~ Upsertion
      mode: 'Create',
    },
  });
}
</script>

<template>
  <base-icon-btn
    icon="mdi-plus"
    density="compact"
    v-tooltip:bottom="'Create space'"
    @click="openCreateSpaceDialog"
  />
</template>
