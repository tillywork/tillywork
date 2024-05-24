<script setup lang="ts">
import type { List } from '../lists/types';
import { useListsService } from '@/composables/services/useListsService';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '@/components/common/dialogs/types';

const listMenu = ref(false);
const listsService = useListsService();
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();
const dialog = useDialog();

const deleteListMutation = listsService.useDeleteListMutation();

defineProps<{
  list: List;
}>();
const emit = defineEmits(['hover:freeze', 'hover:unfreeze']);

function handleListMenuClick() {
  listMenu.value = !listMenu.value;
  emit('hover:freeze');
}

function handleDeleteList(list: List) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: 'Are you sure you want to delete this list?',
      onCancel: dialog.closeDialog,
      onConfirm: () => deleteList(list),
      isLoading: deleteListMutation.isPending.value,
    },
  });
}

function deleteList(list: List) {
  deleteListMutation
    .mutateAsync(list.id)
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['list', list.id] });
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

watch(listMenu, () => {
  if (!listMenu.value) {
    emit('hover:unfreeze');
  }
});
</script>

<template>
  <base-icon-btn
    id="list-menu-btn"
    icon="mdi-dots-vertical"
    @click.stop
    @click="handleListMenuClick"
    density="compact"
  />

  <v-menu
    v-model="listMenu"
    target="#list-menu-btn"
    :close-on-content-click="false"
  >
    <v-card :loading="deleteListMutation.isPending.value">
      <v-list>
        <v-list-item
          class="text-error text-body-2"
          @click="handleDeleteList(list)"
        >
          <template #prepend>
            <v-icon size="small" icon="mdi-delete" />
          </template>
          Delete
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>
