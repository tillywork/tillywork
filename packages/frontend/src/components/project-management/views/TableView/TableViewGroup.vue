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
import type { TableSortOption } from './types';
import { useDialog } from '@/composables/useDialog';
import type { ProjectUser } from '@/components/common/projects/types';
import { DIALOGS } from '@/components/common/dialogs/types';
import type { Card } from '../../cards/types';
import { FlexRender } from '@tanstack/vue-table';
import draggable from 'vuedraggable';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';

const emit = defineEmits([
  'toggle:group',
  'row:delete',
  'row:update:stage',
  'row:update:due-date',
  'row:update:assignees',
]);
const props = defineProps<{
  listGroup: Row<ListGroup>;
  sortBy?: TableSortOption[];
  listStages: ListStage[];
  projectUsers: ProjectUser[];
  table: Table<ListGroup>;
}>();
const rowMenuOpen = ref<Row<Card> | null>();
const isGroupCardsLoading = defineModel<boolean>('loading');

const dialog = useDialog();
const cardsService = useCardsService();
const { showSnackbar } = useSnackbarStore();

const groupCopy = ref(props.listGroup);
const sortBy = computed(() => props.sortBy);
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
  props.listGroup.original.name === 'Tasks' ? 'calc(100vh - 230px)' : 350
);

const isDraggingDisabled = computed(() => {
  return (
    ![ListGroupOptions.LIST_STAGE, ListGroupOptions.ALL].includes(
      props.listGroup.original.type
    ) || sortBy.value
  );
});

const users = computed(() =>
  props.projectUsers.map((projectUser) => projectUser.user)
);

const cards = ref<Card[]>(props.listGroup.original.cards?.cards ?? []);
const total = ref(props.listGroup.original.cards?.total ?? 0);

const { fetchNextPage, isFetching, hasNextPage, refetch, data } =
  cardsService.useGetGroupCardsInfinite({
    listId: groupCopy.value.original.listId,
    groupId: groupCopy.value.original.id,
    filters: groupCopy.value.original.filter,
    initialCards: groupCopy.value.original.cards,
    sortBy,
  });

const { mutateAsync: updateCardList, isPending: isUpdatingCardList } =
  cardsService.useUpdateCardListMutation();

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
  let user: ProjectUser | undefined;

  if (group.type === ListGroupOptions.ASSIGNEES) {
    user = props.projectUsers.find((user: ProjectUser) => {
      return user.user.id == group.entityId;
    });
  }

  return user ? [{ ...user }] : undefined;
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
      message:
        'Dragging cards is only enabled when sorting is disabled and when grouping by list stage.',
      color: 'error',
      timeout: 5000,
    });
  }
}

function onDragEnd(event: any) {
  const { oldIndex, newIndex } = event;
  isDragging.value = false;

  if (oldIndex !== newIndex) {
    const previousItem = draggableCards.value[newIndex - 1]?.original;
    const currentItem = draggableCards.value[newIndex].original;
    const nextItem = draggableCards.value[newIndex + 1]?.original;

    const currentCardList = currentItem.cardLists.find(
      (cl) => cl.listId === props.listGroup.original.listId
    );

    let newOrder: number;
    if (!previousItem) {
      newOrder = nextItem.cardLists[0].order / 2;
    } else if (!nextItem) {
      newOrder = previousItem.cardLists[0].order + 100;
    } else {
      newOrder =
        (nextItem.cardLists[0].order + previousItem.cardLists[0].order) / 2;
    }

    newOrder = Math.round(newOrder);

    updateCardList({
      cardId: currentItem.id,
      cardListId: currentCardList!.id,
      updateCardListDto: {
        order: newOrder,
      },
    }).catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    });
  }
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

function handleUpdateCardStage({
  cardId,
  cardListId,
  listStageId,
}: {
  cardId: number;
  cardListId: number;
  listStageId: number;
}) {
  emit('row:update:stage', {
    cardId,
    cardListId,
    listStageId,
  });
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

watch(data, (v) => {
  if (v) {
    cards.value = v?.pages.map((page) => page.cards).flat() ?? [];
    total.value = v?.pages[0].total ?? 0;
    draggableCards.value = groupTable.getCoreRowModel().rows;
  }
});

watch(
  () => props.listGroup.original.cards,
  () => {
    refetch();
  }
);

watchEffect(() => {
  if (isFetching.value || isUpdatingCardList.value) {
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
    :border="listGroup.getIsExpanded() ? 'b-thin' : 'none'"
    bg-color="accent"
    style="z-index: 10"
  >
    <v-btn
      variant="text"
      density="comfortable"
      size="small"
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
        <v-icon :color="listGroup.original.color" size="20">
          {{ listGroup.original.icon ?? 'mdi-circle-slice-8' }}
        </v-icon>
      </template>
      <v-chip
        rounded="md"
        density="comfortable"
        :color="listGroup.original.color"
        class="ms-3"
      >
        {{ listGroup.original.name }}
        <template #append>
          <span class="text-caption ms-4 font-weight-bold">
            {{ total }}
          </span>
        </template>
      </v-chip>
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
  <template v-if="listGroup.getIsExpanded()">
    <v-list
      class="pa-0 overflow-scroll"
      rounded="0"
      :height="groupHeight"
      :max-height="maxHeight"
      :nav="false"
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
          :setData="setDragItem"
          item-key="id"
          animation="100"
          ghost-class="v-list-item--active"
        >
          <template #item="{ element: row }">
            <v-list-item
              class="pa-0"
              rounded="0"
              height="33"
              :to="`/pm/card/${row.original.id}`"
            >
              <v-hover
                #="{ isHovering: isRowHovering, props: rowProps }"
                :disabled="isDragging"
              >
                <v-card
                  color="transparent"
                  v-bind="rowProps"
                  height="33"
                  class="table-row d-flex align-center text-body-2"
                  rounded="0"
                  link
                >
                  <template
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                  >
                    <template v-if="cell.column.columnDef.id === 'actions'">
                      <v-card
                        :width="cell.column.getSize()"
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
                          <base-icon-btn
                            class="cursor-grab"
                            icon="mdi-cursor-move"
                            variant="text"
                          />
                        </div>
                      </v-card>
                    </template>
                    <template v-else-if="cell.column.columnDef.id === 'title'">
                      <v-card
                        :width="cell.column.getSize()"
                        class="d-flex align-center fill-height text-body-2 px-2 table-cell"
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
                        <span class="line-height-1 ms-2">
                          {{ row.original.title }}
                        </span>
                      </v-card>
                    </template>
                    <template v-else-if="cell.column.columnDef.id === 'dueAt'">
                      <v-card
                        :width="cell.column.getSize()"
                        class="table-cell d-flex align-center fill-height"
                        rounded="0"
                        color="transparent"
                        link
                      >
                        <base-date-picker
                          :model-value="row.original.dueAt"
                          @update:model-value="(newValue: string) => handleUpdateDueDate({
                            card: row.original,
                            newDueDate: newValue,
                          })"
                          class="text-caption d-flex flex-fill justify-start rounded-0"
                          label="No due date"
                          @click.prevent
                        />
                      </v-card>
                    </template>
                    <template v-else-if="cell.column.columnDef.id === 'users'">
                      <v-card
                        :width="cell.column.getSize()"
                        class="table-cell d-flex align-center fill-height"
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
                        :width="cell.column.getSize()"
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
