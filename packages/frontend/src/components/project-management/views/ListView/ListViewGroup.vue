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
  type List,
  type ListGroup,
  type ListStage,
} from '../../lists/types';
import { useCardsService } from '@/services/useCardsService';
import type { TableSortOption, View } from '../types';
import type { ProjectUser } from '@/components/common/projects/types';
import { DIALOGS } from '@/components/common/dialogs/types';
import type { Card } from '../../cards/types';
import draggable from 'vuedraggable';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import type { QueryFilter, ViewFilter } from '../../filters/types';
import { useDialogStore } from '@/stores/dialog';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';
import { useCardTypeFields } from '@/composables/useCardTypeFields';
import { FieldTypes } from '../../fields/types';
import { useCard } from '@/composables/useCard';

const emit = defineEmits([
  'toggle:group',
  'row:delete',
  'row:update:stage',
  'row:update:assignees',
  'row:update:order',
]);
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

const dialog = useDialogStore();
const cardsService = useCardsService();
const { showSnackbar } = useSnackbarStore();

const { updateFieldValue } = useCard();

const { titleField, pinnedFields } = useCardTypeFields({
  cardTypeId: props.list.defaultCardType.id,
});

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

function handleUserSelection({ users, card }: { users: User[]; card: Card }) {
  emit('row:update:assignees', {
    users,
    card,
  });
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
  <template v-if="listGroup.getIsExpanded()">
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
                  height="33"
                  :to="`/pm/card/${row.original.id}`"
                  :ripple="false"
                  v-bind="rowProps"
                >
                  <template #prepend>
                    <div
                      :style="{ width: '30px' }"
                      class="d-flex justify-end me-2"
                    >
                      <div v-if="isRowHovering || rowMenuOpen?.id === row.id">
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
                    <div class="d-flex align-center ga-2 me-6">
                      <template v-for="field in pinnedFields" :key="field.slug">
                        <template v-if="field.type === FieldTypes.DATE">
                          <base-date-picker
                            :model-value="row.original.data[field.slug]"
                            @update:model-value="(v: string) => updateFieldValue({
                                card: row.original,
                                field,
                                v
                            })"
                            class="text-caption d-flex justify-start rounded-0"
                            :label="`Set ${field.name.toLowerCase()}`"
                            @click.prevent
                          />
                        </template>
                        <template v-else>
                          <span class="text-error text-xs"
                            >Unknown field type: {{ field.type }}</span
                          >
                        </template>
                      </template>

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
