<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
  type Table,
} from '@tanstack/vue-table';
import draggable from 'vuedraggable';

import {
  ListGroupOptions,
  type QueryFilter,
  type ViewFilter,
  type View,
  FieldTypes,
  type ListGroup,
  type ListStage,
  type ProjectUser,
  type List,
  type Card,
  type SortState,
  CardTypeLayout,
} from '@tillywork/shared';

import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';

import { useCardsService } from '@/services/useCardsService';

import { useListGroup } from '@/composables/useListGroup';
import { useCard } from '@/composables/useCard';
import { useFields } from '@/composables/useFields';

import { useFieldQueryStore } from '@/stores/field.query';

import BaseField from '@/components/common/fields/BaseField.vue';
import ContextMenu from '@/components/common/base/ContextMenu/ContextMenu.vue';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';

const props = defineProps<{
  listGroup: Row<ListGroup>;
  listStages: ListStage[];
  projectUsers: ProjectUser[];
  table: Table<ListGroup>;
  columnSizes: {
    id: string;
    size: number;
  }[];
  noGroupBanners?: boolean;
  view: View;
  list: List;
}>();

const isGroupCardsLoading = defineModel<boolean>('loading');

const cards = ref<Card[]>([]);

const { useGetGroupCardsInfinite } = useCardsService();

const { updateFieldValue, getCardContextMenuItems } = useCard();

const { getDateFieldColor } = useFields({});
const { titleField } = storeToRefs(useFieldQueryStore());

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
const columns = computed(
  () => props.table._getColumnDefs() as ColumnDef<Card, unknown>[]
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

const total = ref(0);

const { fetchNextPage, isFetching, hasNextPage, refetch, data } =
  useGetGroupCardsInfinite({
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
  get columns() {
    return columns.value;
  },
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

function getColumnSize(columnId: string) {
  const columnSize = props.columnSizes.find((cs) => cs.id === columnId);
  return columnSize?.size;
}

/**
 * @param {FieldTypes} fieldType
 * @returns boolean Whether or not this field should be rendered as a base field, or just the value
 */
function shouldRenderField(fieldType: FieldTypes) {
  return ![FieldTypes.TEXT, FieldTypes.EMAIL, FieldTypes.URL].includes(
    fieldType
  );
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

watchEffect(() => {
  if (isFetching.value) {
    isGroupCardsLoading.value = true;
  } else {
    isGroupCardsLoading.value = false;
  }
});
</script>

<template>
  <v-banner
    sticky
    lines="one"
    density="comfortable"
    :border="groupCopy.isExpanded ? 'b-thin' : 'none'"
    bg-color="accent-lighten"
    style="z-index: 10"
    v-if="!noGroupBanners"
  >
    <base-icon-btn
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
        <v-icon :color="listGroup.original.color" size="small">
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
    <base-icon-btn
      class="ms-4"
      icon="mdi-plus"
      @click="openCreateCardDialog(listGroup.original)"
    />
  </v-banner>
  <template v-if="groupCopy.isExpanded">
    <v-list
      class="pa-0 overflow-scroll"
      rounded="0"
      :lines="false"
      bg-color="card"
    >
      <v-infinite-scroll @load="handleGroupCardsLoad">
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
              <v-list-item
                class="pa-0"
                rounded="0"
                min-height="33"
                :to="`/card/${row.original.id}`"
                :ripple="false"
              >
                <v-hover
                  #="{ isHovering: isRowHovering, props: rowProps }"
                  :disabled="isDragging"
                  @update:model-value="
                    (v) =>
                      handleHoverCard({ isHovering: v, card: row.original })
                  "
                >
                  <v-card
                    color="transparent"
                    v-bind="rowProps"
                    min-height="33"
                    class="table-row d-flex text-body-3 flex-fill align-items-stretch"
                    rounded="0"
                    link
                    :ripple="false"
                  >
                    <template
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                    >
                      <template
                        v-if="cell.column.columnDef.cellType === 'actions'"
                      >
                        <v-card
                          :width="getColumnSize(cell.column.columnDef.id)"
                          class="table-cell d-flex align-center pe-1"
                          rounded="0"
                          color="transparent"
                        >
                          <div
                            class="d-flex flex-fill justify-end ga-1"
                            v-if="isRowHovering"
                          >
                            <base-icon-btn
                              v-bind="props"
                              icon="mdi-dots-vertical"
                              @click.prevent="showMenu"
                            />
                          </div>
                        </v-card>
                      </template>
                      <template
                        v-else-if="cell.column.columnDef.cellType === 'title'"
                      >
                        <v-card
                          :width="getColumnSize(cell.column.columnDef.id)"
                          class="d-flex align-center text-body-3 px-2 table-cell"
                          rounded="0"
                          color="transparent"
                        >
                          <list-stage-selector
                            v-if="list.listStages.length"
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
                            <span
                              class="ms-2"
                              :class="{
                                'text-truncate': !isRowHovering,
                              }"
                            >
                              {{ row.original.data[titleField.slug] }}
                            </span>
                          </template>
                          <template v-else>
                            <template
                              v-if="
                                list.defaultCardType.layout ===
                                CardTypeLayout.PERSON
                              "
                            >
                              <span
                                class="ms-2"
                                :class="{
                                  'text-truncate': !isRowHovering,
                                }"
                              >
                                {{ row.original.data.first_name }}
                                {{ row.original.data.last_name }}
                              </span>
                            </template>
                            <v-skeleton-loader
                              v-else
                              type="text"
                              width="100%"
                            />
                          </template>

                          <!-- Progress -->
                          <base-card-children-progress
                            v-if="row.original.children.length > 0"
                            :card="row.original"
                            border="thin"
                            min-width="fit-content"
                            class="text-caption ms-2"
                            style="
                              padding-top: 2px !important;
                              padding-bottom: 2px !important;
                            "
                          />
                        </v-card>
                      </template>
                      <template v-else>
                        <v-card
                          :width="getColumnSize(cell.column.columnDef.id)"
                          class="table-cell d-flex align-center"
                          rounded="0"
                          color="transparent"
                          link
                        >
                          <template
                            v-if="
                              shouldRenderField(cell.column.columnDef.cellType)
                            "
                          >
                            <base-field
                              class="h-100"
                              :field="cell.column.columnDef.field"
                              :model-value="
                                row.original.data[
                                  cell.column.columnDef.field.slug
                                ]
                              "
                              :color="
                                getDateFieldColor(
                                  row.original,
                                  cell.column.columnDef.field
                                )
                              "
                              rounded="0"
                              flex-fill
                              @update:model-value="
                                (v: any) => updateFieldValue({ 
                                    card: row.original,
                                    field: cell.column.columnDef.field,
                                    v
                                })
                              "
                              hide-icon
                              table
                              @click.stop
                            />
                          </template>
                          <template v-else>
                            <div class="pa-2">
                              <flex-render
                                :render="cell.column.columnDef.cell"
                                :props="cell.getContext()"
                              />
                            </div>
                          </template>
                        </v-card>
                      </template>
                    </template>
                  </v-card>
                </v-hover>
              </v-list-item>
            </context-menu>
          </template>
        </draggable>
      </v-infinite-scroll>
    </v-list>
  </template>
</template>
