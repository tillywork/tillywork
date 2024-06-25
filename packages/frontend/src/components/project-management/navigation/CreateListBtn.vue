<script setup lang="ts">
import { DIALOGS, UpsertDialogMode } from '@/components/common/dialogs/types';
import type { Space } from '../spaces/types';
import { useDialogStore } from '@/stores/dialog';

const props = defineProps<{
  space: Space;
}>();

const dialog = useDialogStore();

function openCreateListDialog() {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_LIST,
    data: {
      space: props.space,
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
