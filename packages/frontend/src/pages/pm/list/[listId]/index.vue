<script setup lang="ts">
import BaseList from '@/components/project-management/lists/BaseList.vue';
import { useListsService } from '@/composables/services/useListsService';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute('/pm/list/[listId]/');
const router = useRouter();

const listId = computed(() => +route.params.listId);
const listsService = useListsService();
const { data: list, error, refetch } = listsService.useGetListQuery(listId);

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

watch(listId, () => refetch());
</script>

<template>
  <base-list v-if="list" :list />
</template>
