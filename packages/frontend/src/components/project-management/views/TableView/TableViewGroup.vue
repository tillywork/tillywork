<script setup lang="ts">
import {
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
  type Table,
} from '@tanstack/vue-table';
import {
  ListGroupOptions,
  type ListGroup,
  type ListStage,
} from '../../lists/types';
import { useCardsService } from '@/composables/services/useCardsService';
import type { TableSortOption, View } from '../types';
import type { ProjectUser } from '@/components/common/projects/types';
import { DIALOGS } from '@/components/common/dialogs/types';
import type { Card } from '../../cards/types';
import { FlexRender } from '@tanstack/vue-table';
import draggable from 'vuedraggable';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import type { QueryFilter } from '../../filters/types';
import { useDialogStore } from '@/stores/dialog';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';

const emit = defineEmits([
  'toggle:group',
  'row:delete',
  'row:update:stage',
  'row:update:due-date',
  'row:update:assignees',
  'row:update:order',
]);
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
}>();
const rowMenuOpen = ref<Row<Card> | null>();
const isGroupCardsLoading = defineModel<boolean>('loading');

const dialog = useDialogStore();
const cardsService = useCardsService();
const { showSnackbar } = useSnackbarStore();

const groupCopy = ref(cloneDeep(props.listGroup));
const sortBy = computed<TableSortOption[]>(() =>
  props.view.sortBy ? [cloneDeep(props.view.sortBy)] : []
);
const tableSortState = computed(() =>
  sortBy.value?.map((sortOption) => {
    return { id: sortOption.key, desc: sortOption.order === 'desc' };
  })
);
const columns = computed(
  () => props.table._getColumnDefs() as ColumnDef<Card, unknown>[]
);

const groupHeight = computed(() => (cards.value.length ?? 0) * 33 + 33);
const maxHeight = computed(() =>
  props.listGroup.original.name === 'All' ? 'calc(100vh - 230px)' : 350
);

const isDraggingDisabled = computed(() => {
  return sortBy.value && sortBy.value.length > 0;
});

const users = computed(() =>
  props.projectUsers.map((projectUser) => projectUser.user)
);

const filters = computed<QueryFilter>(() => {
  if (props.view.filters) {
    return objectUtils.deepMergeObjects(
      cloneDeep(props.view.filters),
      cloneDeep(props.listGroup.original.filter) ?? {}
    );
  } else {
    return props.listGroup.original.filter ?? {};
  }
});

const ignoreCompleted = computed<boolean>(() => props.view.ignoreCompleted);
const ignoreChildren = computed<boolean>(() => props.view.ignoreChildren);

const cards = ref<Card[]>([]);
const total = ref(0);

const { fetchNextPage, isFetching, hasNextPage, refetch, data } =
  cardsService.useGetGroupCardsInfinite({
    listId: groupCopy.value.original.listId,
    groupId: groupCopy.value.original.id,
    ignoreCompleted,
    ignoreChildren,
    filters,
    sortBy,
  });

const groupTable = useVueTable({
  get data() {
    return cards.value;
  },
  columns: columns.value,
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
const isDragging = ref(false);

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

function toggleGroupExpansion(listGroup: Row<ListGroup>) {
  emit('toggle:group', listGroup);
}

function openCreateCardDialog(listGroup: ListGroup) {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_CARD,
    data: {
      listId: listGroup.listId,
      listStage: getCurrentStage(listGroup),
      users: getCurrentAssignee(listGroup),
      listStages: props.listStages,
    },
  });
}

function getCurrentStage(group: ListGroup) {
  let stage: ListStage | undefined;

  if (group.type === ListGroupOptions.LIST_STAGE) {
    stage = props.listStages.find((stage) => {
      return stage.id == group.entityId;
    });
  }

  return stage ? { ...stage } : undefined;
}

function getCurrentAssignee(group: ListGroup) {
  let user: User | undefined;

  if (group.type === ListGroupOptions.ASSIGNEES) {
    user = props.projectUsers.find((user: ProjectUser) => {
      return user.user.id == group.entityId;
    })?.user;
  }

  return user ? [user] : undefined;
}

function onDragMove() {
  if (isDraggingDisabled.value) {
    isDragging.value = false;
    return false;
  }
}

function onDragStart() {
  isDragging.value = true;

  if (isDraggingDisabled.value) {
    showSnackbar({
      message: 'Dragging cards is only enabled when sorting is disabled.',
      color: 'error',
      timeout: 5000,
    });
  }
}

function onDragEnd() {
  isDragging.value = false;
}

function onDragUpdate(event: any) {
  const { newIndex } = event;
  isDragging.value = false;

  const previousCard = draggableCards.value[newIndex - 1]?.original;
  const currentCard = draggableCards.value[newIndex]?.original;
  const nextCard = draggableCards.value[newIndex + 1]?.original;

  handleUpdateCardOrder({
    currentCard,
    previousCard,
    nextCard,
  });
}

function onDragAdd(event: any) {
  const { newIndex } = event;
  isDragging.value = false;

  const previousCard = draggableCards.value[newIndex - 1]?.original;
  const currentCard = draggableCards.value[newIndex]?.original;
  const nextCard = draggableCards.value[newIndex + 1]?.original;

  const newOrder = cardsService.calculateCardOrder({ previousCard, nextCard });

  handleUpdateCardStage({
    cardId: currentCard.id,
    cardListId: currentCard.cardLists[0].id,
    listStageId: props.listGroup.original.entityId!,
    order: newOrder,
  });
}

function handleUpdateCardOrder(data: {
  currentCard: Card;
  previousCard?: Card;
  nextCard?: Card;
}) {
  emit('row:update:order', data);
}

function setDragItem(data: DataTransfer) {
  const img = new Image();
  img.src = 'https://en.wikipedia.org/wiki/File:1x1.png#/media/File:1x1.png';
  data.setDragImage(img, 0, 0);
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

function handleDeleteCard(card: Card) {
  emit('row:delete', card);
}

function handleUpdateCardStage(data: {
  cardId: number;
  cardListId: number;
  listStageId: number;
  order?: number;
}) {
  emit('row:update:stage', data);
}

function handleUpdateDueDate({
  newDueDate,
  card,
}: {
  newDueDate: string;
  card: Card;
}) {
  emit('row:update:due-date', {
    newDueDate,
    card,
  });
}

function handleUserSelection({ users, card }: { users: User[]; card: Card }) {
  emit('row:update:assignees', {
    users,
    card,
  });
}

function getColumnSize(columnId: string) {
  const columnSize = props.columnSizes.find((cs) => cs.id === columnId);
  return columnSize?.size;
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
</script>

<template>
  <v-banner
    sticky
    lines="one"
    density="comfortable"
    :border="listGroup.getIsExpanded() ? 'b-thin' : 'none'"
    bg-color="accent"
    style="z-index: 10"
    v-if="!noGroupBanners"
  >
    <base-icon-btn
      :icon="
        listGroup.getIsExpanded() ? 'mdi-chevron-down' : 'mdi-chevron-right'
      "
      :color="listGroup.getIsExpanded() ? 'info' : 'default'"
      class="me-2"
      @click="toggleGroupExpansion(listGroup)"
    />
    <div>
      <template v-if="listGroup.original.type === ListGroupOptions.ASSIGNEES">
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
  <template v-if="listGroup.getIsExpanded()">
    <v-list
      class="pa-0 overflow-scroll"
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
          :setData="setDragItem"
          item-key="id"
          animation="100"
          ghost-class="v-list-item--active"
          group="cards"
        >
          <template #item="{ element: row }">
            <v-list-item
              class="pa-0"
              rounded="0"
              height="33"
              :to="`/pm/card/${row.original.id}`"
              :ripple="false"
              :base-color="
                row.original.cardLists[0].listStage.isCompleted ? 'success' : ''
              "
              :variant="
                row.original.cardLists[0].listStage.isCompleted
                  ? 'tonal'
                  : undefined
              "
            >
              <v-hover
                #="{ isHovering: isRowHovering, props: rowProps }"
                :disabled="isDragging"
              >
                <v-card
                  color="transparent"
                  v-bind="rowProps"
                  height="33"
                  class="table-row d-flex align-center text-body-3 flex-fill"
                  rounded="0"
                  link
                  :ripple="false"
                >
                  <template
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                  >
                    <template v-if="cell.column.columnDef.id === 'actions'">
                      <v-card
                        :width="getColumnSize(cell.column.columnDef.id)"
                        class="table-cell d-flex align-center fill-height"
                        rounded="0"
                        color="transparent"
                      >
                        <div
                          class="d-flex flex-fill justify-end ga-1"
                          v-if="isRowHovering || rowMenuOpen?.id === row.id"
                        >
                          <v-menu
                            @update:model-value="
                              (v) => handleCardMenuClick({ row, isOpen: v })
                            "
                          >
                            <template #activator="{ props }">
                              <base-icon-btn
                                v-bind="props"
                                icon="mdi-dots-vertical"
                                @click.prevent
                              />
                            </template>
                            <v-card class="border-thin">
                              <v-list>
                                <v-list-item
                                  class="text-error"
                                  @click="handleDeleteCard(row.original)"
                                >
                                  <template #prepend>
                                    <v-icon icon="mdi-delete" />
                                  </template>
                                  <v-list-item-title>Delete</v-list-item-title>
                                </v-list-item>
                              </v-list>
                            </v-card>
                          </v-menu>
                        </div>
                      </v-card>
                    </template>
                    <template v-else-if="cell.column.columnDef.id === 'title'">
                      <v-card
                        :width="getColumnSize(cell.column.columnDef.id)"
                        class="d-flex align-center fill-height text-body-3 px-2 table-cell"
                        rounded="0"
                        color="transparent"
                      >
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
                        <span class="text-truncate ms-2">
                          {{ row.original.title }}
                        </span>

                        <!-- Progress -->
                        <base-card-children-progress
                          v-if="row.original.children.length > 0"
                          :card="row.original"
                          border="thin"
                          rounded="pill"
                          min-width="fit-content"
                          class="text-caption ms-2"
                          style="
                            padding-top: 2px !important;
                            padding-bottom: 2px !important;
                          "
                        />
                      </v-card>
                    </template>
                    <template v-else-if="cell.column.columnDef.id === 'dueAt'">
                      <v-card
                        :width="getColumnSize(cell.column.columnDef.id)"
                        class="table-cell d-flex align-center fill-height"
                        rounded="0"
                        color="transparent"
                        link
                      >
                        <base-date-picker
                          :model-value="row.original.dueAt"
                          @update:model-value="(newValue: string) => handleUpdateDueDate({
                            card: row.original,
                            newDueDate: newValue ?? null,
                          })"
                          class="text-caption d-flex flex-fill h-100 justify-start rounded-0"
                          :color="
                            row.original.cardLists[0].listStage.isCompleted
                              ? 'success'
                              : undefined
                          "
                          label="Set due date"
                          @click.prevent
                        />
                      </v-card>
                    </template>
                    <template v-else-if="cell.column.columnDef.id === 'users'">
                      <v-card
                        :width="getColumnSize(cell.column.columnDef.id)"
                        class="table-cell d-flex align-center fill-height px-1"
                        rounded="0"
                        color="transparent"
                        link
                      >
                        <base-user-selector
                          :model-value="row.original.users"
                          :users
                          fill
                          @update:model-value="
                            (users: User[]) => handleUserSelection({
                                users, card: row.original
                            })
                          "
                          @click.stop
                        />
                      </v-card>
                    </template>
                    <template v-else>
                      <v-card
                        :width="getColumnSize(cell.column.columnDef.id)"
                        class="table-cell d-flex align-center fill-height"
                        rounded="0"
                        color="transparent"
                      >
                        <FlexRender
                          :render="cell.column.columnDef.cell"
                          :props="cell.getContext()"
                        />
                      </v-card>
                    </template>
                  </template>
                </v-card>
              </v-hover>
            </v-list-item>
          </template>
        </draggable>
      </v-infinite-scroll>
    </v-list>
  </template>
</template>

<style lang="scss">
.table {
  .table-row {
    border-bottom: 0.25px solid
      rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
