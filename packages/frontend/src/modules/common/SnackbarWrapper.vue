<template>
  <v-snackbar
    :model-value="true"
    v-for="snackbar in snackbars"
    :key="snackbar.id"
    :color="snackbar.options.color"
    :timeout="snackbar.options.timeout"
  >
    {{ snackbar.options.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbar';
const { snackbars } = useSnackbarStore();
</script>
