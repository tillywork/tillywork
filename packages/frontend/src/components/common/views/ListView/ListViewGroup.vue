<script setup lang="ts">
import {
  getCoreRowModel,
  useVueTable,
  type Row,
  type Table,
} from '@tanstack/vue-table';
import draggable from 'vuedraggable';

import {
  ListGroupOptions,
  type QueryFilter,
  type ViewFilter,
  FieldTypes,
  type View,
  type List,
  type Card,
  type ListGroup,
  type SortState,
} from '@tillywork/shared';

import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';

import { useCardsService } from '@/services/useCardsService';

import { useListGroup } from '@/composables/useListGroup';

import ListViewCard from './ListViewCard.vue';

const props = defineProps<{
  listGroup: Row<ListGroup>;
  table: Table<ListGroup>;
  view: View;
  list: List;
}>();

const cardsService = useCardsService();

const groupCopy = ref(cloneDeep(props.listGroup.original));
const sortBy = computed<SortState>(() =>
  props.view.options.sortBy ? [cloneDeep(props.view.options.sortBy)] : []
);
const tableSortState = computed(() =>
  sortBy.value?.map((sortOption) => {
    return {
      id: sortOption.key,
      desc: sortOption.order.toUpperCase() === 'DESC',
    };
  })
);

const groupHeight = computed(() => (cards.value.length ?? 0) * 33 + 33);
const maxHeight = computed(() =>
  props.listGroup.original.name === 'All' ? 'calc(100vh - 230px)' : 350
);

const filters = computed<QueryFilter>(() => {
  if (props.view.filters) {
    const viewFilters = {
      where: {
        and: [
          ...(cloneDeep((props.view.filters as ViewFilter).where.quick?.and) ??
            []),
          ...(cloneDeep(
            (props.view.filters as ViewFilter).where.advanced?.and
          ) ?? []),
        ],
      },
    };

    return objectUtils.deepMergeObjects(
      viewFilters,
      cloneDeep(props.listGroup.original.filter) ?? {}
    );
  } else {
    return props.listGroup.original.filter ?? {};
  }
});

const hideCompleted = computed<boolean>(
  () => props.view.options.hideCompleted ?? false
);
const hideChildren = computed<boolean>(
  () => props.view.options.hideChildren ?? false
);

const cards = ref<Card[]>([]);
const total = ref(0);

const { fetchNextPage, isFetching, hasNextPage, refetch, data } =
  cardsService.useGetGroupCardsInfinite({
    listId: groupCopy.value.list.id,
    groupId: groupCopy.value.id,
    hideCompleted,
    hideChildren,
    filters,
    sortBy,
  });

const groupTable = useVueTable({
  get data() {
    return cards.value;
  },
  columns: [],
  getCoreRowModel: getCoreRowModel(),
  getRowId: (row) => `${row.id}`,
  manualPagination: true,
  manualGrouping: true,
  manualSorting: true,
  columnResizeMode: 'onChange',
  initialState: {
    sorting: tableSortState.value,
  },
});

const draggableCards = ref(groupTable.getCoreRowModel().rows);
const {
  openCreateCardDialog,
  isDragging,
  setDragItem,
  onDragAdd,
  onDragEnd,
  onDragMove,
  onDragStart,
  onDragUpdate,
  toggleGroupExpansion,
} = useListGroup({
  props,
  cards: draggableCards,
  reactiveGroup: groupCopy,
});

async function handleGroupCardsLoad({
  done,
}: {
  done: (status?: any) => void;
}) {
  if (!isFetching.value && !isDragging.value) {
    fetchNextPage();

    if (hasNextPage.value) {
      done('ok');
    } else {
      done('empty');
    }
  } else {
    done('ok');
  }
}

watch(
  data,
  (v) => {
    if (v) {
      cards.value = v?.pages.map((page) => page.cards).flat() ?? [];
      total.value = v?.pages[0].total ?? 0;
      draggableCards.value = groupTable.getCoreRowModel().rows;
    }
  },
  { immediate: true }
);

watch(
  () => props.view,
  () => {
    refetch();
  },
  { deep: true }
);

watch(
  () => props.listGroup,
  (v) => {
    if (v) {
      groupCopy.value = cloneDeep(v.original);
    }
  }
);
</script>

<template>
  <v-banner
    sticky
    lines="one"
    density="comfortable"
    :border="groupCopy.isExpanded ? 'b-thin t-thin' : 'none'"
    bg-color="accent-lighten"
    style="z-index: 10"
    rounded="0"
  >
    <v-btn
      variant="text"
      density="comfortable"
      size="small"
      :icon="groupCopy.isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
      :color="groupCopy.isExpanded ? 'info' : 'default'"
      class="me-2"
      @click="toggleGroupExpansion"
    />
    <div>
      <template
        v-if="
          listGroup.original.type === ListGroupOptions.FIELD &&
          listGroup.original.field?.type === FieldTypes.USER
        "
      >
        <base-avatar
          :photo="listGroup.original.icon"
          :text="listGroup.original.name"
          size="x-small"
          class="text-caption"
        />
      </template>
      <template v-else>
        <v-icon :color="listGroup.original.color" size="20">
          {{ listGroup.original.icon ?? 'mdi-circle-slice-8' }}
        </v-icon>
      </template>
      <span class="text-body-3 ms-3">
        {{ listGroup.original.name }}
        <span class="ms-2 text-caption text-color-subtitle">
          {{ total }}
        </span>
      </span>
    </div>
    <v-btn
      variant="text"
      density="comfortable"
      size="small"
      icon="mdi-plus"
      color="info"
      class="ms-2"
      @click="openCreateCardDialog(listGroup.original)"
    />
  </v-banner>
  <template v-if="groupCopy.isExpanded">
    <v-list
      class="pa-0"
      rounded="0"
      :height="groupHeight"
      :max-height="maxHeight"
      :lines="false"
      bg-color="card"
    >
      <v-infinite-scroll
        :height="groupHeight"
        :max-height="maxHeight"
        @load="handleGroupCardsLoad"
      >
        <template #empty></template>
        <template #loading></template>
        <draggable
          v-model="draggableCards"
          :move="onDragMove"
          @start="onDragStart"
          @end="onDragEnd"
          @add="onDragAdd"
          @update="onDragUpdate"
          :delay="300"
          :delay-on-touch-only="true"
          :touch-start-threshold="5"
          :setData="setDragItem"
          item-key="id"
          animation="100"
          ghost-class="v-list-item--active"
          group="cards"
        >
          <template #item="{ element: row }">
            <list-view-card :card="row.original" :isDragging />
          </template>
        </draggable>
      </v-infinite-scroll>
    </v-list>
  </template>
</template>
