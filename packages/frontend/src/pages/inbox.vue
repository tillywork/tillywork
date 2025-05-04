<script setup lang="ts">
import { useStateStore } from '@/stores/state';

import NotificationsList from '@/components/common/notifications/NotificationsList.vue';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const { setTitle } = useStateStore();

onMounted(() => {
  setTitle('Inbox');
});
</script>

<template>
  <NotificationsList />
</template>
