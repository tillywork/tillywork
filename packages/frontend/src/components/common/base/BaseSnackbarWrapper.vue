<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbar';
const { snackbars } = useSnackbarStore();

const snackbarHeight = 48;
const snackbarMargin = 8;

const snackbarOffsets = computed(() => {
  return snackbars.map((_, index) => {
    return (snackbarHeight + snackbarMargin) * index;
  });
});
</script>

<template>
  <div class="d-flex flex-column align-self-start">
    <v-snackbar
      v-for="(snackbar, index) in snackbars"
      :key="snackbar.id"
      :model-value="true"
      :color="snackbar.options.color"
      :timeout="snackbar.options.timeout"
      :style="{ bottom: `${snackbarOffsets[index]}px` }"
    >
      {{ snackbar.options.message }}
      <template #actions>
        <v-btn
          variant="text"
          class="text-capitalize"
          v-if="snackbar.options.showConfirm"
          @click="snackbar.options.onConfirm"
          color="info"
        >
          {{ snackbar.options.confirmText ?? 'Confirm' }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
