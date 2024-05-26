<script setup lang="ts">
import BaseList from '@/components/project-management/lists/BaseList.vue';
import { useListsService } from '@/composables/services/useListsService';
import { useViewsService } from '@/composables/services/useViewsService';

const listsService = useListsService();
const viewsService = useViewsService();

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute('/pm/list/[listId]/view/[viewId]');
const router = useRouter();
const { data: list, error } = listsService.useGetListQuery(
  +route.params.listId
);

const { data: view } = viewsService.useGetViewQuery({
  id: +route.params.viewId,
});

watch(error, (v: any) => {
  if (v.response.status === 404) {
    router.push('/');
  }
});

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
  <base-list v-if="list && view" :list :view :key="view.id" />
</template>
