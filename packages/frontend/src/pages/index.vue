<script setup lang="ts">
import { useStateStore } from '@/stores/state';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const { currentList } = useStateStore();

onMounted(() => {
  // TODO: If no list is selected, navigate to first workspace list.
  if (currentList) {
    window.location.pathname = '/pm/list/' + currentList.id;
  }
});
</script>

<template>&nbsp;</template>
