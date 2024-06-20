<script setup lang="ts">
import { cloneDeep } from 'lodash';
import type { View } from '../views/types';
import { useViewsService } from '@/composables/services/useViewsService';
import { useSnackbarStore } from '@/stores/snackbar';

const props = defineProps<{
  target: string;
  view: View;
}>();
const popover = defineModel<boolean>();
const emit = defineEmits(['after-leave']);

const viewCopy = ref<View>();
const viewsService = useViewsService();
const updateViewMutation = viewsService.useUpdateViewMutation();

const snackbar = useSnackbarStore();

const viewName = ref<string>();

function handleAfterEnter() {
  viewCopy.value = cloneDeep(props.view!);
  viewName.value = viewCopy.value!.name;
}

function handleAfterLeave() {
  const newName = viewName.value!.trim();
  if (newName !== '' && newName !== props.view!.name) {
    viewCopy.value!.name = newName;
    updateViewMutation.mutateAsync(viewCopy.value!).then(() => {
      snackbar.showSnackbar({
        message: 'View name updated.',
        color: 'success',
        timeout: 2000,
      });
    });
  }

  viewCopy.value = undefined;
  viewName.value = undefined;
  emit('after-leave');
}
</script>

<template>
  <v-menu
    v-model="popover"
    :target="target"
    :close-on-content-click="false"
    @after-enter="handleAfterEnter"
    @after-leave="handleAfterLeave"
  >
    <v-card>
      <v-text-field
        v-model="viewName"
        label="Name"
        hide-details
        variant="filled"
      />
      <p class="px-4 py-2 user-select-none">TODO: List Stages?</p>
    </v-card>
  </v-menu>
</template>
