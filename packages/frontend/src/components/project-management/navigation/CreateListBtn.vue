<script setup lang="ts">
import { DIALOGS } from '@/components/common/dialogs/types';
import { useDialog } from '@/composables/useDialog';
import type { Space } from '../spaces/types';

const props = defineProps<{
  space: Space;
}>();

const dialog = useDialog();

function openCreateListDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_LIST,
    data: {
      space: props.space,
    },
  });
}
</script>

<template>
  <base-icon-btn
    icon="mdi-plus"
    density="compact"
    v-tooltip:bottom="'Create list'"
    @click="openCreateListDialog"
  />
</template>
