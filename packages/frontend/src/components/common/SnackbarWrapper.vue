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
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbar';
import { computed } from 'vue';
const { snackbars } = useSnackbarStore();

const snackbarHeight = 48;
const snackbarMargin = 8;

const snackbarOffsets = computed(() => {
  return snackbars.map((_, index) => {
    return (snackbarHeight + snackbarMargin) * index;
  });
});
</script>
