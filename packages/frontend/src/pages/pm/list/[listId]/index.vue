<script setup lang="ts">
import { useStateStore } from '@/stores/state';

import BaseList from '@/components/project-management/lists/BaseList.vue';
import { useListsService } from '@/composables/services/useListsService';

import { useProjectUserActivityService } from '@/composables/services/useProjectUserActivityService';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const { setCurrentList } = useStateStore();

const route = useRoute('/pm/list/[listId]/');
const router = useRouter();

const listId = computed(() => +route.params.listId);
const listsService = useListsService();
const { data: list, error, refetch } = listsService.useGetListQuery(listId);

const { useCreateProjectUserActivityMutation } =
  useProjectUserActivityService();
const { mutateAsync: createProjectUserActivity } =
  useCreateProjectUserActivityMutation();

watch(error, (v: any) => {
  if (v.response.status === 404) {
    router.push('/');
  }
});

watch(
  list,
  (v) => {
    if (v) {
      createProjectUserActivity({
        activity: {
          type: 'ENTITY',
          entityType: 'LIST',
          entityId: listId.value,
        },
      });

      document.title = `${v.name} - tillywork`;
    }
    setCurrentList(v);
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
