<script setup lang="ts">
import BaseListViewTabs from './BaseListViewTabs.vue';
import BaseView from '../views/BaseView.vue';
import { useViewsService } from '@/services/useViewsService';
import type { List, View } from '@tillywork/shared';
import posthog from 'posthog-js';

const { list } = defineProps<{
  list: List;
}>();

const listId = computed(() => list.id);

const { useGetViewsQuery } = useViewsService();
const { data: views } = useGetViewsQuery({ listId });
const view = ref<View>();

watch(
  () => list,
  (v) => {
    posthog.capture('List Opened', { id: v.id, name: v.name });
  },
  { immediate: true }
);
</script>

<template>
  <div class="position-relative bg-surface d-flex flex-column fill-height">
    <div class="px-6 pt-2 pb-0">
      <div class="d-flex align-center mb-2 px-2 pt-1">
        <v-icon :icon="list.icon" :color="list.iconColor" size="small" start />
        <span class="text-h6 font-weight-regular">{{ list.name }}</span>
      </div>
      <base-list-view-tabs v-if="views" v-model="view" :list :views />
    </div>
    <v-divider />
    <template v-if="view">
      <base-view :view :list :key="view.id" />
    </template>
  </div>
</template>
