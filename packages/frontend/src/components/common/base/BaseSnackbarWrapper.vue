<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbar';
const { snackbars, closeSnackbar } = useSnackbarStore();

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
      location="end"
      :key="snackbar.id"
      :model-value="true"
      :color="snackbar.options.color"
      variant="flat"
      rounded="lg"
      :timeout="snackbar.options.timeout ?? 4000"
      :style="{ bottom: `${snackbarOffsets[index]}px` }"
      @after-leave="closeSnackbar(snackbar.id)"
    >
      <span class="text-body-3">{{ snackbar.options.message }}</span>
      <template #actions>
        <v-btn
          v-if="
            snackbar.options.showConfirm === undefined
              ? true
              : snackbar.options.showConfirm
          "
          variant="text"
          class="text-none text-caption"
          @click="snackbar.options.onConfirm ?? closeSnackbar(snackbar.id)"
          color="default"
        >
          {{ snackbar.options.confirmText ?? 'Confirm' }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
