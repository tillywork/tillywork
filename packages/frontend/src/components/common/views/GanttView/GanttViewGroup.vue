<script setup lang="ts">
import {
  getCoreRowModel,
  useVueTable,
  type Row,
  type Table,
} from '@tanstack/vue-table';
import draggable from 'vuedraggable';
import { differenceInDays } from 'date-fns';

import {
  ListGroupOptions,
  type QueryFilter,
  type ViewFilter,
  FieldTypes,
  type View,
  type List,
  type Card,
  type ListGroup,
  type ListStage,
  type SortState,
  type Field,
} from '@tillywork/shared';

import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';

import { useCardsService } from '@/services/useCardsService';

import { useListGroup } from '@/composables/useListGroup';
import { useCard } from '@/composables/useCard';
import { useFields } from '@/composables/useFields';

import { useFieldQueryStore } from '@/stores/field.query';

import BaseField from '@/components/common/fields/BaseField.vue';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';
import ContextMenu from '@/components/common/base/ContextMenu/ContextMenu.vue';

const { listGroup, table, view, list, columns, dateRange } = defineProps<{
  listGroup: Row<ListGroup>;
  table: Table<ListGroup>;
  view: View;
  list: List;
  columns: Array<{ date: Date; width: number }>;
  dateRange: { start: Date; end: Date };
}>();

const cardsService = useCardsService();

const { updateFieldValue, getCardContextMenuItems } = useCard();
const { getDateFieldColor } = useFields({});

const { titleField, assigneeField, pinnedFieldsWithoutAssignee } = storeToRefs(
  useFieldQueryStore()
);

const groupCopy = ref(cloneDeep(listGroup.original));
const sortBy = computed<SortState>(() =>
  view.options.sortBy ? [cloneDeep(view.options.sortBy)] : []
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
  listGroup.original.name === 'All' ? 'calc(100vh - 230px)' : 350
);

const filters = computed<QueryFilter>(() => {
  if (view.filters) {
    const viewFilters = {
      where: {
        and: [
          ...(cloneDeep((view.filters as ViewFilter).where.quick?.and) ?? []),
          ...(cloneDeep((view.filters as ViewFilter).where.advanced?.and) ??
            []),
        ],
      },
    };

    return objectUtils.deepMergeObjects(
      viewFilters,
      cloneDeep(listGroup.original.filter) ?? {}
    );
  } else {
    return listGroup.original.filter ?? {};
  }
});

const hideCompleted = computed<boolean>(
  () => view.options.hideCompleted ?? false
);
const hideChildren = computed<boolean>(
  () => view.options.hideChildren ?? false
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
  handleUpdateCardStage,
  handleHoverCard,
} = useListGroup({
  props: { listGroup, view, list },
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

function getCardPosition(card: Card) {
  if (!card.data.start_at || !card.data.due_at) return null;

  const start = new Date(card.data.start_at);
  const end = new Date(card.data.due_at);

  const offsetDays = differenceInDays(start, dateRange.start);
  const duration = differenceInDays(end, start);

  if (offsetDays < 0 || duration <= 0) return null;

  const left = offsetDays * columns[0].width;
  const width = duration * columns[0].width;

  return {
    left: `${left}px`,
    width: `${width}px`,
  };
}

function getCardStyle(card: Card) {
  const position = getCardPosition(card);
  if (!position) return null;

  return {
    ...position,
  };
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
  () => view,
  () => {
    refetch();
  },
  { deep: true }
);

watch(
  () => listGroup,
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
    width="100%"
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
            <context-menu
              :items="getCardContextMenuItems(row.original)"
              #="{ showMenu }"
            >
              <v-hover
                #="{ isHovering: isRowHovering, props: rowProps }"
                :disabled="isDragging"
                @update:model-value="
                  (v) => handleHoverCard({ isHovering: v, card: row.original })
                "
              >
                <v-list-item
                  class="list-row text-body-3 border-b-thin"
                  rounded="0"
                  height="36"
                  :to="`/card/${row.original.id}`"
                  :ripple="false"
                  v-bind="rowProps"
                >
                  <template #prepend>
                    <div
                      :style="{ width: '30px' }"
                      class="d-flex justify-end me-2"
                    >
                      <template v-if="isRowHovering">
                        <base-icon-btn
                          v-bind="rowProps"
                          icon="mdi-dots-vertical"
                          @click.prevent="showMenu"
                        />
                      </template>
                    </div>
                  </template>
                  <v-list-item-title class="d-flex align-center ga-1">
                    <list-stage-selector
                      :model-value="row.original.cardLists[0].listStage"
                      theme="icon"
                      rounded="circle"
                      :list-stages="listStages ?? []"
                      @update:modelValue="
                        (modelValue: ListStage) =>
                        handleUpdateCardStage({
                            cardId: row.original.id,
                            cardListId: row.original.cardLists[0].id,
                            listStageId: modelValue.id,
                        })
                    "
                      @click.prevent
                    />

                    <template v-if="titleField">
                      <span class="text-truncate ms-2">
                        {{ row.original.data[titleField.slug] }}
                      </span>
                    </template>
                    <template v-else>
                      <v-skeleton-loader type="text" width="100%" />
                    </template>

                    <!-- Progress -->
                    <base-card-children-progress
                      v-if="row.original.children.length > 0"
                      :card="row.original"
                      border="thin"
                      class="text-caption ms-2"
                      style="
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                      "
                    />
                  </v-list-item-title>
                </v-list-item>
              </v-hover>
            </context-menu>
          </template>
        </draggable>
      </v-infinite-scroll>
    </v-list>
  </template>
</template>
