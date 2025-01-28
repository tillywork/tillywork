<script setup lang="ts">
import { DIALOGS, UpsertDialogMode } from '@/components/common/dialogs/types';
import { useDialogStore } from '@/stores/dialog';
import type { Space } from '@tillywork/shared';

const { space } = defineProps<{
  space: Space;
}>();

const dialog = useDialogStore();

function openCreateListDialog() {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_LIST,
    data: {
      space,
      mode: UpsertDialogMode.CREATE,
    },
  });
}
</script>

<template>
  <base-icon-btn
    icon="mdi-plus"
    density="compact"
    v-tooltip:bottom="'Create list'"
    @click.stop="openCreateListDialog"
  />
</template>
