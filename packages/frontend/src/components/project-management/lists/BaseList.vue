<script setup lang="ts">
import ListViewTabs from './ListViewTabs.vue';
import BaseView from '../views/BaseView.vue';
import BaseAvatar from '@/components/common/base/BaseAvatar.vue';
import type { List } from './types';

const props = defineProps<{
  list: List;
  viewId?: number;
}>();

const views = computed(() => props.list.views);
</script>

<template>
  <div class="list-container position-relative" v-if="list">
    <div class="pa-4 pb-0">
      <div class="px-9">
        <div class="d-flex align-center mb-3">
          <base-avatar
            :text="list.name"
            color="rgb(116, 140, 7)"
            size="x-small"
            rounded="sm"
          />
          <p class="text-h5 ms-2 mt-1">{{ list.name }}</p>
        </div>
        <keep-alive>
          <list-view-tabs :views="views" />
        </keep-alive>
      </div>
    </div>
    <v-divider />
    <template v-if="viewId">
      <suspense>
        <base-view :view-id="viewId" />
      </suspense>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.list-container {
  height: calc(100vh - 48px);
}
</style>
