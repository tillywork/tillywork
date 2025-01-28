<script setup lang="ts">
import { DIALOGS } from '@/components/common/dialogs/types';
import { useDialogStore } from '@/stores/dialog';
import { useStateStore } from '@/stores/state';

const dialog = useDialogStore();
const { selectedModule } = storeToRefs(useStateStore());

function openCreateWorkspaceDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_WORKSPACE,
    data: {
      type: selectedModule.value,
    },
    options: {
      fullscreen: true,
    },
  });
}
</script>

<template>
  <v-btn
    color="default"
    density="compact"
    variant="text"
    rounded="xl"
    @click="openCreateWorkspaceDialog"
  >
    <v-icon>mdi-plus</v-icon>
    <span class="text-capitalize text-caption">New workspace</span>
  </v-btn>
</template>
