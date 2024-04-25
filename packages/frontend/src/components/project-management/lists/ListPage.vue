<script setup lang="ts">
import { useListsService } from '@/composables/services/useListsService';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import ListViewTabs from './ListViewTabs.vue';

const listId = computed(() => +route.params.listId);
const listsService = useListsService();
const route = useRoute();

const { data: list, refetch: refetchList } = useQuery({
  queryKey: ['list', listId.value],
  queryFn: () => listsService.getList(listId.value),
});

watch(list, () => {
  document.title = `${list.value?.name} | FalconDrive`;
});

watch(listId, () => refetchList());
</script>

<template>
  <div class="pa-4 pb-0">
    <div class="px-4" v-if="list">
      <p class="text-h5 mb-3">{{ list.name }}</p>
      <list-view-tabs v-model:views="list.views" />
    </div>
  </div>
  <v-divider />
  <router-view />
</template>
