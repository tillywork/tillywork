<script setup lang="ts">
import { useStateStore } from '@/stores/state';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const router = useRouter();
const { currentList } = useStateStore();

onMounted(() => {
  // TODO: If no list is selected, navigate to first workspace list.
  if (currentList) {
    router.push('/pm/list/' + currentList.id);
  }
});
</script>

<template>&nbsp;</template>
