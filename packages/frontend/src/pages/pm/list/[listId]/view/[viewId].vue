<script lang="ts">
import { defineBasicLoader } from 'unplugin-vue-router/data-loaders/basic';
import { useListsService } from '@/composables/services/useListsService';

const listsService = useListsService();
export const useListData = defineBasicLoader(async (to) => {
  return listsService.getList(+to.params.listId);
});
</script>

<script setup lang="ts">
import BaseList from '@/components/project-management/lists/BaseList.vue';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute('/pm/list/[listId]/view/[viewId]');
const { data: list } = useListData();

watch(list, () => (document.title = `${list.value.name} - tillywork`), {
  immediate: true,
});
</script>

<template>
  <base-list :list :view-id="+route.params.viewId" />
</template>
