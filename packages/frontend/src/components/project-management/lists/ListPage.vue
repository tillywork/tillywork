<script setup lang="ts">
import { useListsService } from '@/composables/services/useListsService';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import ListViewTabs from './ListViewTabs.vue';
import BaseView from '../views/BaseView.vue';

const route = useRoute();
const listId = computed(() => +route.params.listId);
const listsService = useListsService();
const viewId = computed(() => +route.params.viewId);
const views = computed(() => list.value?.views ?? []);

const {
  data: list,
  refetch: refetchList,
  isFetching: isListFetching,
} = useQuery({
  queryKey: ['list', listId.value],
  queryFn: () => listsService.getList(listId.value),
  refetchOnWindowFocus: false,
});

watch(list, () => {
  document.title = `${list.value?.name} | TillyWork`;
});

watch(listId, () => refetchList());
</script>

<template>
  <div class="list-container position-relative" v-if="list">
    <div class="pa-4 pb-0">
      <div class="px-9 pt-6">
        <p class="text-h5 mb-3">{{ list.name }}</p>
        <list-view-tabs
          :views="views"
          :key="route.fullPath"
          v-if="!isListFetching"
        />
        <v-progress-circular
          v-else
          active
          color="primary"
          width="2"
          indeterminate
          size="24"
        />
      </div>
    </div>
    <v-divider />
    <template v-if="viewId">
      <base-view />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.list-container {
  height: calc(100vh - 48px);
}
</style>
