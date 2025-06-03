<script setup lang="ts">
import { useSnackbarStore, type Snackbar } from '@/stores/snackbar';

import BaseSnackbar from './BaseSnackbar.vue';

const { closeSnackbar } = useSnackbarStore();
const { snackbars } = storeToRefs(useSnackbarStore());

const snackbarHeight = 44;
const snackbarMargin = 8;
const closingSnackbars = ref(new Set<number>());

const snackbarOffsets = computed(() => {
  return snackbars.value.map((_, index) => {
    return (snackbarHeight + snackbarMargin) * index;
  });
});

function handleSnackbarClose(snackbar: Snackbar) {
  closingSnackbars.value.add(snackbar.id);
}

function handleSnackbarLeave(snackbar: Snackbar) {
  closingSnackbars.value.delete(snackbar.id);
  closeSnackbar(snackbar.id);
}
</script>

<template>
  <template v-for="(snackbar, index) in snackbars" :key="snackbar.id">
    <Teleport to=".v-overlay-container">
      <Transition @after-leave="handleSnackbarLeave(snackbar)">
        <base-snackbar
          v-if="!closingSnackbars.has(snackbar.id)"
          :color="snackbar.options.color"
          :timeout="snackbar.options.timeout ?? 4000"
          :style="{
            bottom: `${snackbarOffsets[index]}px`,
            transition: 'all ease 0.2s',
          }"
          @close="handleSnackbarClose(snackbar)"
        >
          <span class="text-body-3">{{ snackbar.options.message }}</span>
          <template #actions>
            <v-btn
              v-if="snackbar.options.showConfirm"
              variant="text"
              class="text-none text-caption"
              @click="snackbar.options.onConfirm"
              color="default"
              density="comfortable"
            >
              {{ snackbar.options.confirmText ?? 'Confirm' }}
            </v-btn>
          </template>
        </base-snackbar>
      </Transition>
    </Teleport>
  </template>
</template>
