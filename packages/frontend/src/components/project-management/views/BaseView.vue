<script setup lang="ts">
import { ListGroupOptions, type List, type ListGroup } from '../lists/types';
import { useViewsService } from '@/composables/services/useViewsService';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import type { Card } from '../cards/types';
import { type ColumnDef } from '@tanstack/vue-table';
import BaseViewChipGroupBy from './BaseViewChipGroupBy.vue';
import BaseViewChipSort from './BaseViewChipSort.vue';
import TableView from './TableView/TableView.vue';
import { type TableSortOption } from './TableView/types';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '@/components/common/dialogs/types';
import { ViewTypes, type View } from './types';
import { useQueryClient } from '@tanstack/vue-query';
import { useCardsService } from '@/composables/services/useCardsService';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';

const props = defineProps<{
  view: View;
  list: List;
}>();
const viewCopy = ref<View>({ ...props.view });
const viewsService = useViewsService();
const cardsService = useCardsService();
const listGroupsService = useListGroupsService();
const dialog = useDialog();
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();

const groupBy = computed(() => props.view.groupBy);
const sortBy = computed(() => (props.view.sortBy ? [props.view.sortBy] : []));

const isViewLoading = ref(false);

const isPageLoading = computed(() => {
  return (
    updateViewMutation.isPending.value ||
    isFetchingGroups.value ||
    isUpdatingCard.value ||
    isUpdatingStage.value ||
    isDeletingCard.value ||
    isViewLoading.value
  );
});

const columns = ref<ColumnDef<ListGroup, any>[]>([
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
    size: 800,
  },
  {
    id: 'users',
    accessorKey: 'users',
    header: 'Assignee',
    size: 100,
  },
  {
    id: 'dueAt',
    accessorKey: 'dueAt',
    header: 'Due Date',
    size: 100,
  },
]);

const updateViewMutation = viewsService.useUpdateViewMutation();

const {
  data: listGroups,
  isFetching: isFetchingGroups,
  refetch: refetchListGroups,
} = listGroupsService.useGetListGroupsByOptionQuery({
  listId: props.list.id,
  sortCardsBy: sortBy,
  groupBy,
});

const { mutateAsync: updateCard, isPending: isUpdatingCard } =
  cardsService.useUpdateCardMutation();
const { mutateAsync: updateCardListStage, isPending: isUpdatingStage } =
  cardsService.useUpdateCardListStageMutation();
const { mutateAsync: deleteCard, isPending: isDeletingCard } =
  cardsService.useDeleteCardMutation();

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
  newDueDate: string;
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
}: {
  cardId: number;
  cardListId: number;
  listStageId: number;
}) {
  updateCardListStage({ cardId, cardListId, listStageId })
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
      message: 'Are you sure you want to delete this task?',
      onConfirm: () =>
        deleteCard(card.id)
          .then(() => {
            dialog.closeDialog();
          })
          .catch(() => {
            showSnackbar({
              message: 'Something went wrong, please try again!',
              color: 'error',
              timeout: 5000,
            });
          }),
      onCancel: () => dialog.closeDialog(),
      isLoading: isDeletingCard,
    },
  });
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
        Add task
      </v-btn>
      <div class="mx-1">
        <v-divider vertical />
      </div>
      <div class="d-flex align-center ga-2">
        <base-view-chip-group-by
          v-model="viewCopy.groupBy"
          @update:model-value="handleGroupBySelection"
        />
        <v-chip
          link
          rounded="xl"
          density="comfortable"
          variant="outlined"
          color="primary"
          v-tooltip="'Coming soon'"
        >
          <v-icon icon="mdi-filter" size="16" start />
          Filters
        </v-chip>
        <base-view-chip-sort
          v-model="viewCopy.sortBy"
          @update:model-value="handleSortBySelection"
        />
      </div>
    </div>

    <div class="view">
      <template v-if="viewCopy.type === ViewTypes.TABLE">
        <table-view
          v-model:loading="isViewLoading"
          :columns
          :view
          :groups="listGroups ?? []"
          fixed-headers
          @row:delete="handleDeleteCard"
          @row:update:stage="handleUpdateCardStage"
          @row:update:due-date="handleUpdateDueDate"
          @row:update:assignees="handleUpdateAssignees"
        >
        </table-view>
      </template>
      <template v-else>
        <span class="text-body-2 text-error">Error: Unknown view type</span>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.view {
  max-height: calc(100vh - (40px + 113px));
  overflow: auto;
}
</style>
