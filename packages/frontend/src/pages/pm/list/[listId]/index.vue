<script setup lang="ts">
import BaseList from '@/components/project-management/lists/BaseList.vue';
import { useListsService } from '@/composables/services/useListsService';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute('/pm/list/[listId]/');
const listsService = useListsService();
const { data: list } = listsService.useGetListQuery(+route.params.listId);

watch(
  list,
  (v) => {
    if (v) {
      document.title = `${v.name} - tillywork`;
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <base-list v-if="list" :list :key="list.id" />
</template>
