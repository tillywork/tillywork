<script setup lang="ts">
import { type List } from '../lists/types';
import { useViewsService } from '@/services/useViewsService';
import { useListGroupsService } from '@/services/useListGroupsService';
import type { Card } from '../cards/types';
import BaseViewChipGroupBy from './BaseViewChipGroupBy.vue';
import BaseViewChipSort from './BaseViewChipSort.vue';
import TableView from './TableView/TableView.vue';
import { type TableSortOption } from './types';
import { DIALOGS } from '@/components/common/dialogs/types';
import { ViewTypes, type View } from './types';
import { useQueryClient } from '@tanstack/vue-query';
import { useCardsService } from '@/services/useCardsService';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';
import BoardView from './BoardView/BoardView.vue';
import ListView from './ListView/ListView.vue';
import BaseViewChipFilter from './BaseViewChipFilter/BaseViewChipFilter.vue';
import { useFitlersService } from '@/services/useFiltersService';
import {
  FilterEntityTypes,
  type Filter,
  type QueryFilter,
  type ViewFilter,
} from '../filters/types';
import { cloneDeep } from 'lodash';
import { useDialogStore } from '@/stores/dialog';
import BaseViewChipDisplay from './BaseViewChipDisplay.vue';
import { useCardTypeFields } from '@/composables/useCardTypeFields';
import { FieldTypes, type Field } from '../fields/types';
import type { TableColumnDef } from './TableView/types';

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

const hideCompleted = computed(() => props.view.options.hideCompleted);
const groupBy = computed({
  get() {
    return viewCopy.value.options.groupBy;
  },
  set(v) {
    viewCopy.value = {
      ...viewCopy.value,
      options: {
        ...viewCopy.value.options,
        groupBy: v,
      },
    };
  },
});

const sortBy = computed({
  get() {
    return viewCopy.value.options.sortBy;
  },
  set(v) {
    viewCopy.value = {
      ...viewCopy.value,
      options: {
        ...viewCopy.value.options,
        sortBy: v,
      },
    };
  },
});

const isViewLoading = ref(false);

const { titleField } = useCardTypeFields({
  cardTypeId: props.list.defaultCardType.id,
});

const columns = computed<TableColumnDef[]>(() => {
  const actionsColumn: TableColumnDef = {
    id: 'actions',
    enableResizing: false,
    enableSorting: false,
    size: 50,
    cellType: 'actions',
  };

  const usersColumn: TableColumnDef = {
    id: 'users',
    accessorKey: 'users',
    header: 'Assignee',
    size: 100,
    minSize: 100,
    cellType: FieldTypes.USER,
  };

  const titleColumn: TableColumnDef = {
    id: `data.${titleField.value?.slug}`,
    accessorKey: `data.${titleField.value?.slug}`,
    header: titleField.value?.name,
    size: 300,
    minSize: 150,
    cellType: 'title',
    field: titleField.value,
  };

  //TODO get pinned fields by default, and allow user to customize columns in table from fields in table
  const dueAtColumn: TableColumnDef = {
    id: 'data.due_at',
    accessorKey: 'data.due_at',
    header: 'Due Date',
    size: 150,
    minSize: 150,
    cellType: FieldTypes.DATE,
    field: {
      slug: 'due_at',
    } as Field,
  };

  return [actionsColumn, titleColumn, dueAtColumn, usersColumn];
});

const updateViewMutation = viewsService.useUpdateViewMutation();

const { data: listGroups, refetch: refetchListGroups } =
  listGroupsService.useGetListGroupsByOptionQuery({
    listId,
    hideCompleted,
    groupBy,
  });

const { mutateAsync: updateCard } = cardsService.useUpdateCardMutation();
const { mutateAsync: deleteCard, isPending: isDeletingCard } =
  cardsService.useDeleteCardMutation();
const { mutateAsync: updateCardList } =
  cardsService.useUpdateCardListMutation();

const { mutateAsync: createFilter } = useCreateFilterMutation();
const { mutateAsync: updateFilter } = useUpdateFilterMutation();

function handleGroupBySelection() {
  updateViewMutation.mutateAsync(viewCopy.value);
}

function handleSortBySelection(option: TableSortOption) {
  updateViewMutation.mutateAsync({
    ...viewCopy.value,
    options: {
      ...viewCopy.value.options,
      sortBy: option ?? null,
    },
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
      message: `Are you sure you want to delete ${card.data.title}?`,
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
    <div class="view-actions d-flex ga-2 pa-4 overflow-auto">
      <v-btn
        class="text-none text-caption"
        variant="tonal"
        size="small"
        color="primary"
        @click="openCreateCardDialog"
      >
        <template #prepend>
          <v-icon icon="mdi-plus" />
        </template>
        Add {{ list.defaultCardType.name.toLocaleLowerCase() }}
      </v-btn>
      <div class="mx-1">
        <v-divider vertical />
      </div>
      <div class="d-flex align-center ga-2">
        <base-view-chip-group-by
          v-model="groupBy"
          @update:model-value="handleGroupBySelection"
        />
        <base-view-chip-filter
          :filters="(viewCopy.filters as ViewFilter)"
          :view-id="viewCopy.id"
          @update="handleUpdateFilters"
          @save="handleSaveFilters"
        />
        <base-view-chip-sort
          v-model="sortBy"
          @update:model-value="handleSortBySelection"
        />
        <base-view-chip-display :view="viewCopy" />
      </div>
    </div>

    <div class="view">
      <template v-if="viewCopy.type === ViewTypes.TABLE">
        <table-view
          v-model:loading="isViewLoading"
          :columns
          :list
          :view="viewCopy"
          :groups="listGroups ?? []"
          @row:delete="handleDeleteCard"
          @row:update:stage="handleUpdateCardStage"
          @row:update:assignees="handleUpdateAssignees"
          @row:update:order="handleUpdateCardOrder"
        >
        </table-view>
      </template>
      <template v-else-if="viewCopy.type === ViewTypes.BOARD">
        <board-view
          :view="viewCopy"
          :list
          :list-groups="listGroups ?? []"
          @card:delete="handleDeleteCard"
          @card:update:assignees="handleUpdateAssignees"
          @card:update:stage="handleUpdateCardStage"
          @card:update:order="handleUpdateCardOrder"
        />
      </template>
      <template v-else-if="viewCopy.type === ViewTypes.LIST">
        <list-view
          v-model:loading="isViewLoading"
          :columns
          :list
          :view="viewCopy"
          :groups="listGroups ?? []"
          no-headers
          @row:delete="handleDeleteCard"
          @row:update:stage="handleUpdateCardStage"
          @row:update:assignees="handleUpdateAssignees"
          @row:update:order="handleUpdateCardOrder"
        >
        </list-view>
      </template>
      <template v-else>
        <span class="text-body-3 text-error">Error: Unknown view type</span>
      </template>
    </div>
  </div>
</template>
