<script setup lang="ts">
import { useSpacesService } from '@/services/useSpacesService';
import { useSnackbarStore } from '@/stores/snackbar';

import { DIALOGS, UpsertDialogMode } from '@/components/common/dialogs/types';
import type { Space } from '@tillywork/shared';

import { useDialogStore } from '@/stores/dialog';

const spaceMenu = ref(false);
const { useDeleteSpaceMutation } = useSpacesService();
const { showSnackbar } = useSnackbarStore();
const dialog = useDialogStore();

const confirmDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);

const { mutateAsync: deleteSpace, isPending: isDeleting } =
  useDeleteSpaceMutation();

defineProps<{
  space: Space;
}>();
const emit = defineEmits(['hover:freeze', 'hover:unfreeze']);

function handleSpaceMenuClick() {
  spaceMenu.value = !spaceMenu.value;
  emit('hover:freeze');
}

function confirmDeleteSpace(space: Space) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: 'Are you sure you want to delete this space?',
      onCancel: () => dialog.closeDialog(confirmDialogIndex.value),
      onConfirm: () => handleDeleteSpace(space),
      isLoading: isDeleting.value,
    },
  });
}

function handleDeleteSpace(space: Space) {
  deleteSpace(space.id)
    .then(() => {
      dialog.closeDialog(confirmDialogIndex.value);
    })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 3000,
      });
    });
}

function openUpdateSpaceDialog(space: Space) {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_SPACE,
    data: {
      space,
      mode: UpsertDialogMode.UPDATE,
    },
  });
  spaceMenu.value = false;
}

watch(spaceMenu, () => {
  if (!spaceMenu.value) {
    emit('hover:unfreeze');
  }
});
</script>

<template>
  <base-icon-btn
    id="space-menu-btn"
    icon="mdi-dots-vertical"
    @click.stop="handleSpaceMenuClick"
    density="compact"
  />

  <v-menu
    v-model="spaceMenu"
    target="#space-menu-btn"
    :close-on-content-click="false"
  >
    <v-card :loading="isDeleting">
      <v-list>
        <v-list-item @click="openUpdateSpaceDialog(space)">
          <template #prepend>
            <v-icon icon="mdi-playlist-edit" />
          </template>
          <v-list-item-title>Edit</v-list-item-title>
        </v-list-item>
        <v-list-item class="text-error" @click="confirmDeleteSpace(space)">
          <template #prepend>
            <v-icon icon="mdi-delete" />
          </template>
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>
