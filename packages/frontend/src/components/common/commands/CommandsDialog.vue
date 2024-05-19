<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core';
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { ref } from 'vue';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '../dialogs/types';

const dialogState = defineModel<boolean>();
const keys = useMagicKeys();
const width = ref(700);
const dialog = useDialog();

watch(keys.current, (v) => {
  if (openKeysClicked(v)) {
    toggleDialog();
  }
});

/**
 * Set up a global event listener to prevent the default action.
 * Only add commands that have browser specific events here
 * @param event
 */
const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
  }
};
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

function openKeysClicked(keys: Set<string>) {
  return (keys.has('meta') || keys.has('control')) && keys.has('k');
}

function toggleDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_CARD,
  });
}

function handleDialogClose() {
  console.debug('Dialog closed');
}
</script>

<template>
  <v-dialog
    v-model="dialogState"
    @after-leave="handleDialogClose"
    :scrim="false"
    :width
  >
  </v-dialog>
</template>
