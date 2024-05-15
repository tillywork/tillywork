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
import { useQueryClient } from '@tanstack/vue-query';
import BaseViewChipGroupBy from './BaseViewChipGroupBy.vue';
import BaseViewChipSort from './BaseViewChipSort.vue';
import BaseViewGroup from './BaseViewGroup.vue';
import {
  DEFAULT_PAGINATION_OPTIONS,
  type TableSortOption,
} from './TableView/types';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '@/components/common/dialogs/types';
import type { View } from './types';

const props = defineProps<{
  viewId: number;
}>();
const viewCopy = ref<View>();
const route = useRoute();
const router = useRouter();
const listId = computed(() => +route.params.listId);
const viewsService = useViewsService();
const listGroupsService = useListGroupsService();
const dialog = useDialog();

const isPageLoading = computed(() => {
  return (
    isViewFetching.value ||
    getListGroupsQuery.isFetching.value ||
    updateViewMutation.isPending.value
  );
});

const columns = ref<ColumnDef<Card, any>[]>([
  {
    id: 'actions',
    enableResizing: false,
    enableSorting: false,
    size: 40,
    maxSize: 50,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Title',
    size: 680,
  },
  {
    id: 'info',
    size: 200,
  },
]);

const rowHovered = ref<Row<Card>>();

const queryClient = useQueryClient();
const {
  data: view,
  isFetched: isViewFetched,
  isFetching: isViewFetching,
  refetch: refetchView,
} = viewsService.useGetViewQuery({
  id: props.viewId,
});

watch(
  view,
  (v) => {
    if (v) {
      viewCopy.value = {
        ...v,
      } as View;
    }
  },
  { deep: true, immediate: true }
);

watch(viewCopy, (view) => {
  if (view) {
    getListGroupsQuery.refetch();
  }
});

const groupBy = computed(() => {
  if (view.value?.groupBy) {
    console.log(view.value.groupBy);
    return view.value.groupBy;
  } else {
    return ListGroupOptions.ALL;
  }
});

const getListGroupsQuery = listGroupsService.useGetListGroupsByOptionQuery({
  listId: listId.value,
  groupBy,
  enabled: isViewFetched,
});

const updateViewMutation = viewsService.useUpdateViewMutation();
const paginationOptions = ref(DEFAULT_PAGINATION_OPTIONS);

watch(listId, () => {
  if (listId.value !== viewCopy.value?.listId) {
    router.replace(`/pm/list/${listId.value}`);
  }
});

function handleRowClick(row: Row<Card>) {
  //   router.push({
  //     name: 'CardPage',
  //     params: {
  //       cardId: row.original.id,
  //     },
  //   });
}

function handleGroupBySelection(option: ListGroupOptions) {
  updateViewMutation.mutate({
    ...viewCopy.value,
    groupBy: option,
  } as View);
}

function handleSortBySelection(option: TableSortOption) {
  console.log(option.key);
}

function openCreateCardDialog() {
  dialog.openDialog(DIALOGS.CREATE_CARD, {
    list: queryClient.getQueryData(['list', listId.value]),
  });
}
</script>

<template>
  <div class="view-container">
    <div class="d-flex ga-2 py-4 px-12" v-if="viewCopy">
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
        color="primary"
        @click="openCreateCardDialog"
      >
        <v-icon icon="mdi-plus" />
        Add task
      </v-btn>
      <div class="mx-1">
        <v-divider vertical />
      </div>
      <div class="d-flex align-center ga-2">
        <base-view-chip-group-by
          v-model="viewCopy.groupBy"
          @update:model-value="handleGroupBySelection"
        />
        <v-chip
          link
          rounded="xl"
          density="comfortable"
          variant="outlined"
          color="primary"
        >
          <v-icon icon="mdi-filter" size="16" start />
          Filters
        </v-chip>
        <base-view-chip-sort
          :model-value="viewCopy.sortBy"
          @update:model-value="handleSortBySelection"
        />
      </div>
    </div>

    <suspense>
      <div
        class="groups-container"
        v-if="viewCopy && getListGroupsQuery?.data.value"
      >
        <template
          v-for="group in getListGroupsQuery.data.value"
          :key="group.name"
        >
          <base-view-group
            :view="viewCopy"
            :group="group"
            v-model:options="paginationOptions"
            :columns="columns"
            @click:row="handleRowClick"
            v-model:row:hovered="rowHovered"
            class="mb-3"
          />
        </template>
      </div>
    </suspense>
  </div>
</template>

<style lang="scss" scoped>
.groups-container {
  max-height: calc(100vh - (40px + 113px));
  overflow: auto;
}
</style>
