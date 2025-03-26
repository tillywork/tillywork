<script setup lang="ts">
import { useStateStore } from '@/stores/state';

import AutomationsList from '@/components/common/automations/AutomationsList.vue';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const { setTitle } = useStateStore();
const route = useRoute();

onMounted(() => {
  setTitle('Automations');
});
</script>

<template>
  <automations-list :initial-list-id="+route.query.listId" />
</template>
