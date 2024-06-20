<script setup lang="ts">
import { useSpacesService } from '@/composables/services/useSpacesService';
import type { Space } from '../spaces/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { cloneDeep } from 'lodash';

const props = defineProps<{
  space: Space;
}>();
const spaceCopy = cloneDeep(props.space);
const spacesService = useSpacesService();
const updateSpaceMutation = spacesService.useUpdateSpaceMutation();

const snackbar = useSnackbarStore();

const popover = ref(false);
const emit = defineEmits(['hover:freeze', 'hover:unfreeze']);

const spaceName = ref(props.space.name);

function handleRenameSpacePopoverClick() {
  popover.value = !popover.value;
  emit('hover:freeze');
}

function handleKeyEnter() {
  const newName = spaceName.value.trim();
  if (newName !== '' && newName !== props.space.name) {
    spaceCopy.name = newName;
    updateSpaceMutation.mutateAsync(spaceCopy).then(() => {
      snackbar.showSnackbar({
        message: 'Space name updated.',
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
    id="rename-space-popover-btn"
    icon="mdi-rename-outline"
    density="compact"
    @click.stop="handleRenameSpacePopoverClick"
  />

  <v-menu
    v-model="popover"
    target="#rename-space-popover-btn"
    :width="250"
    :close-on-content-click="false"
  >
    <v-card>
      <v-text-field
        v-model="spaceName"
        autofocus
        single-line
        hide-details
        variant="filled"
        @keydown.enter="handleKeyEnter"
      />
      <v-card-subtitle
        class="user-select-none"
        @click="handleRenameSpacePopoverClick"
      >
        Press Enter to Rename
      </v-card-subtitle>
    </v-card>
  </v-menu>
</template>
