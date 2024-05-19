<script setup lang="ts">
import BaseIconBtn from '@/components/common/base/BaseIconBtn.vue';
import type { Space } from '../spaces/types';
import { useSpacesService } from '@/composables/services/useSpacesService';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '@/components/common/dialogs/types';

const spaceMenu = ref(false);
const spacesService = useSpacesService();
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();
const dialog = useDialog();

const deleteSpaceMutation = spacesService.useDeleteSpaceMutation();

defineProps<{
  space: Space;
}>();
const emit = defineEmits(['hover:freeze', 'hover:unfreeze']);

function handleSpaceMenuClick() {
  spaceMenu.value = !spaceMenu.value;
  emit('hover:freeze');
}

function handleDeleteSpace(space: Space) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: 'Are you sure you want to delete this space?',
      onCancel: dialog.closeDialog,
      onConfirm: () => deleteSpace(space),
      isLoading: deleteSpaceMutation.isPending.value,
    },
  });
}

function deleteSpace(space: Space) {
  deleteSpaceMutation
    .mutateAsync(space.id)
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['space', space.id] });
      dialog.closeDialog();
    })
    .catch((e) => {
      console.log(e);
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 3000,
      });
    });
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
    @click.stop
    @click="handleSpaceMenuClick"
    density="compact"
  />

  <v-menu
    v-model="spaceMenu"
    target="#space-menu-btn"
    offset="3"
    width="200"
    :close-on-content-click="false"
  >
    <v-card color="accent" :loading="deleteSpaceMutation.isPending.value">
      <v-list nav>
        <v-list-item
          class="text-error text-body-2"
          @click="handleDeleteSpace(space)"
        >
          <template #prepend>
            <v-icon size="18" icon="mdi-delete" />
          </template>
          Delete
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>
