<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import CommandsDialog from '@/components/common/commands/CommandsDialog.vue';
import BaseDialog from '@/components/common/dialogs/BaseDialog.vue';
import SnackbarWrapper from '@/components/common/SnackbarWrapper.vue';
</script>

<template>
  <router-view />
  <commands-dialog />
  <base-dialog />
  <snackbar-wrapper />
  <VueQueryDevtools />
</template>
