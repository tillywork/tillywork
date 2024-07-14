<script setup lang="ts">
import BaseListViewTabs from './BaseListViewTabs.vue';
import BaseView from '../views/BaseView.vue';
import type { List } from './types';
import type { View } from '../views/types';
import { useViewsService } from '@/composables/services/useViewsService';

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
    <div class="pa-4 pb-0">
      <div class="px-9">
        <div class="d-flex align-center mb-3">
          <v-icon :icon="list.icon" :color="list.iconColor" disabled start />
          <span class="text-h5 ms-2">{{ list.name }}</span>
        </div>
        <base-list-view-tabs v-if="views" v-model="view" :list :views />
      </div>
    </div>
    <v-divider />
    <template v-if="view">
      <base-view :view :list />
    </template>
  </div>
</template>
