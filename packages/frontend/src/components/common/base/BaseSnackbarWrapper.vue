<script setup lang="ts">
import { useSnackbarStore, type Snackbar } from '@/stores/snackbar';

import BaseSnackbar from './BaseSnackbar.vue';

const { closeSnackbar } = useSnackbarStore();
const { snackbars } = storeToRefs(useSnackbarStore());

const snackbarHeight = 44;
const snackbarMargin = 8;

const snackbarOffsets = computed(() => {
  return snackbars.value.map((_, index) => {
    return (snackbarHeight + snackbarMargin) * index;
  });
});

function handleSnackbarLeave(snackbar: Snackbar) {
  closeSnackbar(snackbar.id);
}
</script>

<template>
  <div class="d-flex flex-column align-self-start">
    <template v-for="(snackbar, index) in snackbars" :key="snackbar.id">
      <base-snackbar
        :model-value="true"
        :color="snackbar.options.color"
        :timeout="snackbar.options.timeout ?? 4000"
        :style="{ bottom: `${snackbarOffsets[index]}px` }"
        @close="handleSnackbarLeave(snackbar)"
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
    </template>
  </div>
</template>
