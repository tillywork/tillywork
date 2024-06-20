<script setup lang="ts">
import { useListsService } from '@/composables/services/useListsService';
import type { List } from '../lists/types';
import { useSnackbarStore } from '@/stores/snackbar';

const props = defineProps<{
  list: List;
}>();
const listsService = useListsService();
const updateListMutation = listsService.useUpdateListMutation();

const snackbar = useSnackbarStore();

const popover = ref(false);
const emit = defineEmits(['hover:freeze', 'hover:unfreeze']);

const listName = ref(props.list.name);

function handleRenameListPopoverClick() {
  popover.value = !popover.value;
  emit('hover:freeze');
}

function handleKeyEnter() {
  const newName = listName.value.trim();
  if (newName !== '' && newName !== props.list.name) {
    updateListMutation
      .mutateAsync({ id: props.list.id, updateDto: { name: newName } })
      .then(() => {
        snackbar.showSnackbar({
          message: 'List name updated.',
          color: 'success',
          timeout: 2000,
        });
      });
  }
}

watch(popover, () => {
  if (!popover.value) {
    emit('hover:unfreeze');
  }
});
</script>

<template>
  <base-icon-btn
    id="rename-list-popover-btn"
    icon="mdi-rename-outline"
    density="compact"
    @click.stop="handleRenameListPopoverClick"
  />

  <v-menu
    v-model="popover"
    target="#rename-list-popover-btn"
    :width="250"
    :close-on-content-click="false"
  >
    <v-card>
      <v-text-field
        v-model="listName"
        autofocus
        single-line
        hide-details
        variant="filled"
        @keydown.enter="handleKeyEnter"
      />
      <v-card-subtitle
        class="user-select-none"
        @click="handleRenameListPopoverClick"
      >
        Press Enter to Rename
      </v-card-subtitle>
    </v-card>
  </v-menu>
</template>
