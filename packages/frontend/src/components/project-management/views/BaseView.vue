<script setup lang="ts">
import { ListGroupOptions, type List, type ListGroup } from '../lists/types';
import { useViewsService } from '@/composables/services/useViewsService';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import type { Card } from '../cards/types';
import { type ColumnDef } from '@tanstack/vue-table';
import BaseViewChipGroupBy from './BaseViewChipGroupBy.vue';
import BaseViewChipSort from './BaseViewChipSort.vue';
import TableView from './TableView/TableView.vue';
import { DEFAULT_SORT_OPTIONS, type TableSortOption } from './types';
import { DIALOGS } from '@/components/common/dialogs/types';
import { ViewTypes, type View } from './types';
import { useQueryClient } from '@tanstack/vue-query';
import { useCardsService } from '@/composables/services/useCardsService';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';
import BoardView from './BoardView/BoardView.vue';
import ListView from './ListView/ListView.vue';
import BaseViewChipFilter from './BaseViewChipFilter/BaseViewChipFilter.vue';
import { useFitlersService } from '@/composables/services/useFiltersService';
import {
  FilterEntityTypes,
  type Filter,
  type QueryFilter,
} from '../filters/types';
import { cloneDeep } from 'lodash';
import { useDialogStore } from '@/stores/dialog';
import BaseViewChipDisplay from './BaseViewChipDisplay.vue';

const props = defineProps<{
  view: View;
  list: List;
}>();
const listId = computed(() => props.list.id);
const viewCopy = ref<View>(cloneDeep(props.view));
const viewsService = useViewsService();
const cardsService = useCardsService();
const listGroupsService = useListGroupsService();
const { useCreateFilterMutation, useUpdateFilterMutation } =
  useFitlersService();
const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();

const confirmDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);

const ignoreCompleted = computed(() => props.view.ignoreCompleted);
const groupBy = computed(() => props.view.groupBy);

const isViewLoading = ref(false);
const sortByOptions = DEFAULT_SORT_OPTIONS;

const isPageLoading = computed(() => {
  return (
    updateViewMutation.isPending.value ||
    isFetchingGroups.value ||
    isUpdatingCard.value ||
    isDeletingCard.value ||
    isViewLoading.value
  );
});

const columns = ref<ColumnDef<ListGroup, any>[]>([
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
    size: 800,
    minSize: 150,
  },
  {
    id: 'users',
    accessorKey: 'users',
    header: 'Assignee',
    size: 100,
    minSize: 100,
  },
  {
    id: 'dueAt',
    accessorKey: 'dueAt',
    header: 'Due Date',
    size: 100,
    minSize: 100,
  },
]);

const updateViewMutation = viewsService.useUpdateViewMutation();

const {
  data: listGroups,
  isFetching: isFetchingGroups,
  refetch: refetchListGroups,
} = listGroupsService.useGetListGroupsByOptionQuery({
  listId,
  ignoreCompleted,
  groupBy,
});

const { mutateAsync: updateCard, isPending: isUpdatingCard } =
  cardsService.useUpdateCardMutation();
const { mutateAsync: deleteCard, isPending: isDeletingCard } =
  cardsService.useDeleteCardMutation();
const { mutateAsync: updateCardList } =
  cardsService.useUpdateCardListMutation();

const { mutateAsync: createFilter } = useCreateFilterMutation();
const { mutateAsync: updateFilter } = useUpdateFilterMutation();

function handleGroupBySelection(option: ListGroupOptions) {
  updateViewMutation.mutateAsync({
    ...viewCopy.value,
    groupBy: option,
  });
}

function handleSortBySelection(option: TableSortOption) {
  updateViewMutation.mutateAsync({
    ...viewCopy.value,
    sortBy: option ?? null, // If no option, we want to clear the sort by setting it to null
  });
}

function openCreateCardDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_CARD,
    data: {
      list: props.list,
      type: props.list.defaultCardType,
    },
  });
}

function handleUpdateAssignees({ users, card }: { users: User[]; card: Card }) {
  const updatedCard: Card = {
    ...card,
    users,
  };

  updateCard(updatedCard).catch(() => {
    showSnackbar({
      message: 'Something went wrong, please try again.',
      color: 'error',
      timeout: 5000,
    });
  });
}

function handleUpdateDueDate({
  card,
  newDueDate,
}: {
  card: Card;
  newDueDate: string | null;
}) {
  const updatedCard = {
    ...card,
    dueAt: newDueDate,
  };
  updateCard(updatedCard);
}

function handleUpdateCardStage({
  cardId,
  cardListId,
  listStageId,
  order,
}: {
  cardId: number;
  cardListId: number;
  listStageId: number;
  order?: number;
}) {
  updateCardList({
    cardId,
    cardListId,
    updateCardListDto: {
      listStageId,
      order,
    },
  })
    .then(() => {
      queryClient.invalidateQueries({
        queryKey: ['listGroups', { listId: props.list.id }],
      });
    })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    });
}

function handleDeleteCard(card: Card) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: `Are you sure you want to delete ${card.title}?`,
      onConfirm: () =>
        deleteCard(card.id)
          .then(() => {
            dialog.closeDialog(confirmDialogIndex.value);
          })
          .catch(() => {
            showSnackbar({
              message: 'Something went wrong, please try again!',
              color: 'error',
              timeout: 5000,
            });
          }),
      onCancel: () => dialog.closeDialog(confirmDialogIndex.value),
      isLoading: isDeletingCard,
    },
  });
}

function handleUpdateCardOrder({
  currentCard,
  previousCard,
  nextCard,
}: {
  currentCard: Card;
  previousCard?: Card;
  nextCard?: Card;
}) {
  const newOrder = cardsService.calculateCardOrder({
    previousCard,
    nextCard,
  });

  updateCardList({
    cardId: currentCard.id,
    cardListId: currentCard.cardLists[0].id,
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

function handleUpdateFilters(filters: QueryFilter | null) {
  viewCopy.value = {
    ...viewCopy.value,
    filters: cloneDeep(filters) as Filter,
  };
}

function handleSaveFilters() {
  if (!props.view.filters) {
    createFilter({
      entityId: viewCopy.value.id,
      entityType: FilterEntityTypes.VIEW,
      name: 'Custom Filters',
      where: viewCopy.value.filters?.where ?? {},
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [
            'views',
            {
              listId: listId.value,
            },
          ],
        });
      })
      .catch(() => {
        showSnackbar({
          message: 'Something went wrong, please try again.',
          color: 'error',
        });
      });
  } else {
    updateFilter({
      id: props.view.filters.id,
      updateFilterDto: {
        where: viewCopy.value.filters?.where,
      },
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [
            'views',
            {
              listId: listId.value,
            },
          ],
        });
      })
      .catch(() => {
        showSnackbar({
          message: 'Something went wrong, please try again.',
          color: 'error',
        });
      });
  }
}

watch(
  () => props.view,
  (v) => {
    if (v) {
      viewCopy.value = { ...v };
      refetchListGroups();
    }
  }
);
</script>

<template>
  <div class="view-container" v-if="viewCopy">
    <div class="view-actions d-flex ga-2 py-4 px-12">
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
        Add {{ list.defaultCardType.name.toLocaleLowerCase() }}
      </v-btn>
      <div class="mx-1">
        <v-divider vertical />
      </div>
      <div class="d-flex align-center ga-2">
        <base-view-chip-group-by
          v-model="viewCopy.groupBy"
          @update:model-value="handleGroupBySelection"
        />
        <base-view-chip-filter
          :filters="viewCopy.filters"
          :view-id="viewCopy.id"
          :list-id="viewCopy.listId"
          @update="handleUpdateFilters"
          @save="handleSaveFilters"
        />
        <base-view-chip-sort
          v-model="viewCopy.sortBy"
          @update:model-value="handleSortBySelection"
          :sort-by-options="sortByOptions"
        />
        <base-view-chip-display :view="viewCopy" />
      </div>
    </div>

    <div class="view">
      <template v-if="viewCopy.type === ViewTypes.TABLE">
        <table-view
          v-model:loading="isViewLoading"
          :columns
          :view="viewCopy"
          :groups="listGroups ?? []"
          @row:delete="handleDeleteCard"
          @row:update:stage="handleUpdateCardStage"
          @row:update:due-date="handleUpdateDueDate"
          @row:update:assignees="handleUpdateAssignees"
          @row:update:order="handleUpdateCardOrder"
        >
        </table-view>
      </template>
      <template v-else-if="viewCopy.type === ViewTypes.BOARD">
        <board-view
          :view="viewCopy"
          :list-groups="listGroups ?? []"
          @card:delete="handleDeleteCard"
          @card:update:assignees="handleUpdateAssignees"
          @card:update:due-date="handleUpdateDueDate"
          @card:update:stage="handleUpdateCardStage"
          @card:update:order="handleUpdateCardOrder"
        />
      </template>
      <template v-else-if="viewCopy.type === ViewTypes.LIST">
        <list-view
          v-model:loading="isViewLoading"
          :columns
          :view="viewCopy"
          :groups="listGroups ?? []"
          @row:delete="handleDeleteCard"
          @row:update:stage="handleUpdateCardStage"
          @row:update:due-date="handleUpdateDueDate"
          @row:update:assignees="handleUpdateAssignees"
          @row:update:order="handleUpdateCardOrder"
        >
        </list-view>
      </template>
      <template v-else>
        <span class="text-body-2 text-error">Error: Unknown view type</span>
      </template>
    </div>
  </div>
</template>
