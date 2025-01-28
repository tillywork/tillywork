<script setup lang="ts">
import Tasks from '@/components/crm/Tasks/Tasks.vue';

import { useStateStore } from '@/stores/state';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const { setTitle } = useStateStore();

setTitle('Tasks');
</script>

<template>
  <tasks />
</template>
