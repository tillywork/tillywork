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
import BaseViewGroup from './BaseViewGroup.vue';
import { DEFAULT_PAGINATION_OPTIONS } from './TableView/types';
import { type View } from './types';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '@/components/common/dialogs/types';

const route = useRoute();
const router = useRouter();
const listId = computed(() => +route.params.listId);
const viewId = computed(() => +route.params.viewId);
const viewsService = useViewsService();
const listGroupsService = useListGroupsService();
const dialog = useDialog();

const isPageLoading = computed(() => {
  return (
    getViewQuery.isFetching.value ||
    (getListGroupsQuery && getListGroupsQuery.isFetching.value) ||
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
  //   {
  //     id: 'listStage',
  //     size: 150,
  //   },
  //   {
  //     id: 'users',
  //   },
  //   {
  //     id: 'dueAt',
  //     minSize: 100,
  //   },
  {
    id: 'info',
    size: 200,
  },
]);

const rowHovered = ref<Row<Card>>();

const queryClient = useQueryClient();
const getViewQuery = viewsService.useGetViewQuery(viewId.value);

const groupBy = computed(() => {
  if (getViewQuery.data.value?.groupBy) {
    console.log(getViewQuery.data.value.groupBy);
    return getViewQuery.data.value.groupBy;
  } else {
    return ListGroupOptions.ALL;
  }
});
let getListGroupsQuery = listGroupsService.useGetListGroupsByOptionQuery({
  listId: listId.value,
  groupBy,
  enabled: getViewQuery.isSuccess,
});

const updateViewMutation = viewsService.useUpdateViewMutation();
const paginationOptions = ref(DEFAULT_PAGINATION_OPTIONS);

watch(getViewQuery.data, (view) => {
  if (view) {
    document.title = `${view.name} | tillywork`;
  }

  queryClient.invalidateQueries({
    queryKey: ['listGroups', { listId: listId.value }],
  });
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

function handleRowClick(row: Row<Card>) {
  router.push({
    name: 'CardPage',
    params: {
      cardId: row.original.id,
    },
  });
}

function handleGroupBySelection(option: ListGroupOptions) {
  updateViewMutation.mutate({
    ...getViewQuery.data.value,
    groupBy: option,
  } as View);
}

function openCreateCardDialog() {
  dialog.openDialog(DIALOGS.CREATE_CARD, {
    list: queryClient.getQueryData(['list', listId.value]),
  });
}
</script>

<template>
  <div class="view-container" ref="viewContainer">
    <div class="d-flex ga-2 py-4 px-12" v-if="getViewQuery.data.value">
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
          v-model="getViewQuery.data.value.groupBy"
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
        <v-chip
          link
          rounded="xl"
          density="comfortable"
          variant="outlined"
          color="primary"
        >
          <v-icon icon="mdi-swap-vertical" size="16" start />
          Sort
        </v-chip>
        <v-chip
          link
          rounded="xl"
          density="comfortable"
          variant="outlined"
          color="primary"
        >
          <v-icon icon="mdi-eye" size="16" start />
          Hide
        </v-chip>
      </div>
    </div>

    <div
      class="groups-container"
      v-if="getViewQuery.data.value && getListGroupsQuery?.data.value"
    >
      <template
        v-for="group in getListGroupsQuery.data.value"
        :key="group.name"
      >
        <base-view-group
          :view="getViewQuery.data.value"
          :group="group"
          v-model:options="paginationOptions"
          :columns="columns"
          @click:row="handleRowClick"
          v-model:row:hovered="rowHovered"
          class="mb-3"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.groups-container {
  max-height: calc(100vh - (40px + 113px));
  overflow: auto;
}
</style>
