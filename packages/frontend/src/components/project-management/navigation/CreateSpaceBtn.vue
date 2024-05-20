<script setup lang="ts">
import BaseIconBtn from '@/components/common/base/BaseIconBtn.vue';
import { DIALOGS } from '@/components/common/dialogs/types';
import { useDialog } from '@/composables/useDialog';

const dialog = useDialog();

function openCreateSpaceDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_SPACE,
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
