<script setup lang="ts">
import BaseListViewTabs from './BaseListViewTabs.vue';
import BaseView from '../views/BaseView.vue';
import type { List } from './types';
import { useViewsService } from '@/services/useViewsService';
import type { View } from '@tillywork/shared';

const props = defineProps<{
  list: List;
}>();

const listId = computed(() => props.list.id);

const { useGetViewsQuery } = useViewsService();
const { data: views } = useGetViewsQuery({ listId });
const view = ref<View>();
</script>

<template>
  <div class="position-relative">
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
