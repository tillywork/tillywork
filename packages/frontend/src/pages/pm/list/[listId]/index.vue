<script setup lang="ts">
import BaseList from '@/components/project-management/lists/BaseList.vue';
import { useListsService } from '@/services/useListsService';
import { useStateStore } from '@/stores/state';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const { setCurrentList, setTitle } = useStateStore();

const route = useRoute('/pm/list/[listId]/');
const router = useRouter();

const listId = computed(() => +route.params.listId);
const { useGetListQuery } = useListsService();
const { data: list, error } = useGetListQuery(listId);

watch(error, () => {
  router.push('/');
});

watch(
  list,
  (v) => {
    if (v) {
      setTitle(v.name);
      setCurrentList(v);
    }
  },
  { immediate: true }
);
</script>

<template>
  <base-list v-if="list" :list />
</template>
