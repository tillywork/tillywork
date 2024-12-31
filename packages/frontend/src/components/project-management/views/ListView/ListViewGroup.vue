<script setup lang="ts">
import {
  getCoreRowModel,
  useVueTable,
  type Row,
  type Table,
} from '@tanstack/vue-table';
import { useCardsService } from '@/services/useCardsService';
import draggable from 'vuedraggable';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';
import { useFields } from '@/composables/useFields';
import { useCard } from '@/composables/useCard';
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
  type ProjectUser,
  type SortState,
  type Field,
} from '@tillywork/shared';
import { useListGroup } from '@/composables/useListGroup';
import BaseField from '@/components/common/fields/BaseField.vue';
import BaseCardActions from '../../cards/BaseCard/BaseCardActions.vue';

const props = defineProps<{
  listGroup: Row<ListGroup>;
  listStages: ListStage[];
  projectUsers: ProjectUser[];
  table: Table<ListGroup>;
  view: View;
  list: List;
}>();
const rowMenuOpen = ref<Row<Card> | null>();
const isGroupCardsLoading = defineModel<boolean>('loading');

const cardsService = useCardsService();

const { updateFieldValue } = useCard();

const {
  titleField,
  assigneeField,
  pinnedFieldsWithoutAssignee,
  getDateFieldColor,
} = useFields({
  cardTypeId: props.list.defaultCardType.id,
  listId: props.list.id,
});

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
  handleDeleteCard,
  handleUpdateCardStage,
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

function handleCardMenuClick({
  row,
  isOpen,
}: {
  row: Row<Card>;
  isOpen: boolean;
}) {
  if (isOpen) {
    rowMenuOpen.value = row;
  } else {
    rowMenuOpen.value = null;
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

watchEffect(() => {
  if (isFetching.value) {
    isGroupCardsLoading.value = true;
  } else {
    isGroupCardsLoading.value = false;
  }
});

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
    :border="groupCopy.isExpanded ? 'b-thin' : 'none'"
    bg-color="accent"
    style="z-index: 10"
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
            <div class="list-row-wrapper">
              <v-hover
                #="{ isHovering: isRowHovering, props: rowProps }"
                :disabled="isDragging"
              >
                <v-list-item
                  class="list-row text-body-3"
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
                      <div v-if="isRowHovering || rowMenuOpen?.id === row.id">
                        <base-card-actions
                          :card="row.original"
                          @update:model-value="
                            (v: boolean) => handleCardMenuClick({ row, isOpen: v })
                          "
                        >
                          <template #activator="{ props }">
                            <base-icon-btn
                              v-bind="props"
                              icon="mdi-dots-vertical"
                              @click.prevent
                            />
                          </template>
                        </base-card-actions>
                      </div>
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
                  <template #append>
                    <div
                      class="d-flex align-center ga-2 me-6"
                      :style="{
                        maxHeight: '28px',
                      }"
                    >
                      <template
                        v-for="field in pinnedFieldsWithoutAssignee"
                        :key="field.slug"
                      >
                        <base-field
                          :field
                          :color="getDateFieldColor(row.original, field)"
                          no-label
                          :model-value="row.original.data[field.slug]"
                          @update:model-value="(v: string) => updateFieldValue({
                                card: row.original,
                                field,
                                v
                            })"
                        />
                      </template>
                      <template v-if="assigneeField">
                        <base-field
                          :field="assigneeField"
                          no-label
                          :model-value="row.original.data[assigneeField.slug]"
                          @update:model-value="(v: string) => updateFieldValue({
                                card: row.original,
                                field: assigneeField as Field,
                                v
                            })"
                        />
                      </template>
                    </div>
                  </template>
                </v-list-item>
              </v-hover>
            </div>
          </template>
        </draggable>
      </v-infinite-scroll>
    </v-list>
  </template>
</template>
