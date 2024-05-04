<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ListGroupOptions } from '../lists/types';
import { watch } from 'vue';
import { useViewsService } from '@/composables/services/useViewsService';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import type { Card } from '../cards/types';
import { computed } from 'vue';
import { type ColumnDef, type Row } from '@tanstack/vue-table';
import { useQuery } from '@tanstack/vue-query';
import BaseCard from '../cards/BaseCard.vue';
import BaseViewGroupByChip from './BaseViewGroupByChip.vue';
import BaseViewGroup from './BaseViewGroup.vue';
import { DEFAULT_PAGINATION_OPTIONS } from './TableView/types';

const route = useRoute();
const router = useRouter();
const listId = computed(() => +route.params.listId);
const viewId = computed(() => +route.params.viewId);
const viewsService = useViewsService();
const listGroupsService = useListGroupsService();

const isPageLoading = computed(() => {
  return getViewQuery.isFetching.value || isGroupsFetching.value;
});
const openedCard = ref<Card>();
const cardDialog = ref(false);

const columns: ColumnDef<Card, any>[] = [
  {
    id: 'actions',
    enableResizing: false,
    enableSorting: false,
    size: 50,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Title',
    size: 400,
    minSize: 100,
  },
  {
    id: 'listStage',
    header: 'Stage',
  },
  {
    id: 'users',
    header: 'Assignees',
  },
  {
    id: 'dueAt',
    header: 'Due Date',
    minSize: 100,
  },
];

const rowHovered = ref<Row<Card>>();
const getViewQuery = useQuery({
  queryKey: ['view', viewId.value],
  queryFn: () => viewsService.getView(viewId.value),
  refetchOnWindowFocus: false,
});
const {
  data: groups,
  refetch: refetchListGroups,
  isFetching: isGroupsFetching,
} = useQuery({
  queryKey: ['groups', listId.value],
  queryFn: getListGroups,
});

const groupBy = ref<ListGroupOptions>(ListGroupOptions.LIST_STAGE);
const paginationOptions = ref(DEFAULT_PAGINATION_OPTIONS);

watch(getViewQuery.data, (view) => {
  if (view) {
    document.title = `${view.name} | tillywork`;
  }
});

watch(
  listId,
  () => {
    if (listId.value !== getViewQuery.data.value?.listId) {
      router.replace({
        name: 'ListPage',
        params: {
          ...route.params,
        },
      });
    }
  },
  {
    immediate: true,
  }
);

async function getListGroups() {
  const groups = await listGroupsService.getListGroupsByOption({
    listId: listId.value,
    groupBy: groupBy.value,
  });

  return groups;
}

function handleRowClick(row: Row<Card>) {
  openedCard.value = row.original;
  openCardDialog();
}

function openCardDialog() {
  cardDialog.value = true;
}

function closeCardDialog() {
  cardDialog.value = false;
}
</script>

<template>
  <div class="d-flex ga-2 py-4 px-12">
    <v-progress-linear
      indeterminate
      color="primary"
      :active="isPageLoading"
      absolute
      location="top"
    />
    <v-btn
      class="text-capitalize"
      size="small"
      variant="tonal"
      rounded="md"
      color="accent"
    >
      <v-icon icon="mdi-plus" />
      Add task
    </v-btn>
    <div class="mx-1">
      <v-divider vertical />
    </div>
    <div class="d-flex align-center ga-2">
      <base-view-group-by-chip
        v-model="groupBy"
        @update:model-value="refetchListGroups()"
      />
      <v-chip
        link
        rounded="xl"
        density="comfortable"
        variant="outlined"
        color="accent"
      >
        <v-icon icon="mdi-filter" size="16" start />
        Filters
      </v-chip>
      <v-chip
        link
        rounded="xl"
        density="comfortable"
        variant="outlined"
        color="accent"
      >
        <v-icon icon="mdi-swap-vertical" size="16" start />
        Sort
      </v-chip>
      <v-chip
        link
        rounded="xl"
        density="comfortable"
        variant="outlined"
        color="accent"
      >
        <v-icon icon="mdi-eye" size="16" start />
        Hide
      </v-chip>
    </div>
  </div>

  <div class="groups-container" v-if="getViewQuery.data.value">
    <template v-for="(group, index) in groups" :key="group.name">
      <base-view-group
        v-if="groups"
        :view="getViewQuery.data.value"
        :group="groups[index]"
        v-model:options="paginationOptions"
        :columns="columns"
        @click:row="handleRowClick"
        v-model:row:hovered="rowHovered"
        class="mb-3"
      />
    </template>
  </div>

  <v-dialog v-model="cardDialog" width="800">
    <base-card
      v-model="openedCard"
      show-close-button
      @click:close="closeCardDialog"
    />
  </v-dialog>
</template>

<style lang="scss" scoped>
.groups-container {
  max-height: calc(100vh - (48px + 60px + 113px));
  overflow: auto;
}
</style>
