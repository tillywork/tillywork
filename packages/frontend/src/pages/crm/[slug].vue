<script setup lang="ts">
import { useCrm } from '@/composables/useCrm';
import BaseList from '@/components/project-management/lists/BaseList.vue';
import { useStateStore } from '@/stores/state';
import type { List } from '@tillywork/shared';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute('/crm/[slug]');
const slug = computed(() => route.params.slug as string);

const { getListBySlug } = useCrm();
const { setCurrentList, setTitle } = useStateStore();

const list = computed(() => getListBySlug(slug.value));

function initCurrentList(list: List) {
  setCurrentList(list);
  setTitle(list.name);
}

watch(
  list,
  (v) => {
    if (v) {
      initCurrentList(v);
    }
  },
  { immediate: true }
);
</script>

<template>
  <template v-if="list">
    <base-list :list />
  </template>
</template>
