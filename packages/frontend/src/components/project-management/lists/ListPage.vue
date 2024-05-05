<script setup lang="ts">
import { useListsService } from '@/composables/services/useListsService';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import ListViewTabs from './ListViewTabs.vue';
import BaseView from '../views/BaseView.vue';
import BaseAvatar from '@/components/common/base/BaseAvatar.vue';

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
  document.title = `${list.value?.name} | tillywork`;
});

watch(listId, () => refetchList());
</script>

<template>
  <div class="list-container position-relative" v-if="list">
    <div class="pa-4 pb-0">
      <div class="px-9">
        <div class="d-flex align-center mb-3">
          <base-avatar
            :text="list.name"
            color="rgb(116, 140, 7)"
            size="22"
            rounded="sm"
          />
          <p class="text-h5 ms-2 mt-1">{{ list.name }}</p>
        </div>
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
