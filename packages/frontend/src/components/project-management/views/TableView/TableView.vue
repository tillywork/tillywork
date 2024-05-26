<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
  type Column,
} from '@tanstack/vue-table';
import {
  type PaginationParams,
  type QueryFilter,
  type TableSortOption,
} from './types';
import type { View } from '../types';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import type { Card } from '../../cards/types';
import { type ListGroup, type ListStage } from '../../lists/types';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import { useAuthStore } from '@/stores/auth';
import TableViewGroup from './TableViewGroup.vue';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';

const options = defineModel<PaginationParams>('options');
const rowHovered = defineModel<Row<Card>>('rowHovered');
const isLoading = defineModel<boolean>('loading');

const props = defineProps<{
  columns: ColumnDef<ListGroup, any>[];
  filters?: QueryFilter;
  noHeaders?: boolean;
  view: View;
  groups: ListGroup[];
  fixedHeaders?: boolean;
}>();

const emit = defineEmits([
  'update:options',
  'row:delete',
  'submit',
  'load',
  'row:update:stage',
  'row:update:due-date',
  'row:update:assignees',
]);

const sortBy = ref<TableSortOption[]>(
  props.view.sortBy ? [props.view.sortBy] : [{ key: 'createdAt', order: 'asc' }]
);
const cardMenuOpen = ref<Row<Card> | null>();
const expandedState = ref<Record<string, boolean>>();

const { showSnackbar } = useSnackbarStore();
const authStore = useAuthStore();

const listGroupsService = useListGroupsService();
const { mutateAsync: updateListGroup } =
  listGroupsService.useUpdateListGroupMutation();

const listsStagesService = useListStagesService();
const { data: listStages } = listsStagesService.useGetListStagesQuery(
  props.view.listId
);

const projectUsersService = useProjectUsersService();
const { data: projectUsers } = projectUsersService.useProjectUsersQuery({
  projectId: authStore.project!.id,
});

const users = computed(() =>
  projectUsers.value?.map((projectUser) => projectUser.user)
);

const table = useVueTable({
  get data() {
    return props.groups;
  },
  columns: props.columns as ColumnDef<ListGroup, any>[],
  getCoreRowModel: getCoreRowModel(),
  getRowId: (row) => `${row.id}`,
  manualPagination: true,
  manualGrouping: true,
  manualSorting: true,
  columnResizeMode: 'onChange',
  enableColumnResizing: false,
  enableSorting: false,
  initialState: {
    sorting: [
      {
        id:
          options.value && options.value.sort
            ? options.value.sort[0].key
            : 'createdAt',
        desc:
          options.value && options.value.sort
            ? options.value.sort[0].order === 'desc'
            : false,
      },
    ],
  },
});

watchEffect(() => {
  const { groups, view } = props;
  if (groups) {
    const state: Record<string, boolean> = {};
    groups.forEach((listGroup) => {
      state[listGroup.id] = listGroup.isExpanded ?? false;
    });
    expandedState.value = state;
    table.setExpanded(expandedState.value);
  }

  if (view.sortBy) {
    sortBy.value = [view.sortBy];
  }
});

function getColumnSortIcon(column: Column<ListGroup, unknown>) {
  switch (column.getIsSorted()) {
    case 'desc':
      return 'mdi-arrow-down';
    case 'asc':
    default:
      return 'mdi-arrow-up';
  }
}

function toggleGroupExpansion(listGroup: Row<ListGroup>) {
  listGroup.toggleExpanded();
  isLoading.value = true;
  updateListGroup({
    ...listGroup.original,
    isExpanded: listGroup.getIsExpanded(),
  })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function handleUserSelection({ users, card }: { users: User[]; card: Card }) {
  emit('row:update:assignees', {
    users,
    card,
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

function handleCardMenuClick({
  row,
  isOpen,
}: {
  row: Row<Card>;
  isOpen: boolean;
}) {
  if (isOpen) {
    cardMenuOpen.value = row;
  } else {
    cardMenuOpen.value = null;
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
</script>

<template>
  <div class="table-container">
    <div class="table d-flex flex-column">
      <div class="table-header">
        <template
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <div class="table-header-group d-flex border-b-thin border-collapse">
            <template v-for="header in headerGroup.headers" :key="header.id">
              <v-hover
                #="{ isHovering: isHeaderHovering, props: headerProps }"
                v-if="!noHeaders"
              >
                <v-card
                  v-bind="headerProps"
                  class="table-header-cell py-1 px-4 text-caption user-select-none d-flex align-center text-truncate"
                  rounded="0"
                  link
                  color="accent"
                  :width="header.getSize()"
                  height="28"
                  :style="`${noHeaders ? 'height: 0px !important;' : ''}`"
                >
                  <!-- Header Content -->
                  <FlexRender
                    v-if="!header.isPlaceholder"
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                  <!-- Sorting Indicator -->
                  <template
                    v-if="!header.isPlaceholder && header.column.getCanSort()"
                  >
                    <v-icon
                      v-show="isHeaderHovering || header.column.getIsSorted()"
                      class="ms-1"
                      :color="
                        header.column.getIsSorted() === false
                          ? 'grey'
                          : undefined
                      "
                    >
                      {{ getColumnSortIcon(header.column) }}
                    </v-icon>
                  </template>
                  <!-- Column Resizer -->
                  <template
                    v-if="isHeaderHovering && header.column.getCanResize()"
                  >
                    <div class="column-resizer">
                      <div
                        @mousedown="header.getResizeHandler()?.($event)"
                        @touchstart="header.getResizeHandler()?.($event)"
                        v-show="
                          isHeaderHovering || header.column.getIsResizing()
                        "
                        @click.stop
                      >
                        &nbsp;
                      </div>
                      &nbsp;
                    </div>
                  </template>
                </v-card>
              </v-hover>
            </template>
          </div>
        </template>
      </div>
      <v-card class="table-groups overflow-scroll">
        <template
          v-for="listGroup in table.getCoreRowModel().rows"
          :key="
            'table-group-' +
            listGroup.original.id +
            '-' +
            listGroup.subRows.length
          "
        >
          <suspense>
            <table-view-group
              v-model:row:hovered="rowHovered"
              v-model:loading="isLoading"
              :list-group="listGroup"
              :list-stages="listStages ?? []"
              :project-users="projectUsers ?? []"
              :sort-by="sortBy"
              :table
              @toggle:group="toggleGroupExpansion"
            >
              <template #actions="{ row }">
                <div class="d-flex flex-fill justify-end">
                  <v-menu
                    @update:model-value="
                      (v) => handleCardMenuClick({ row, isOpen: v })
                    "
                  >
                    <template #activator="{ props }">
                      <base-icon-btn
                        v-if="
                          rowHovered?.original.id === row.original.id ||
                          cardMenuOpen?.original.id === row.original.id
                        "
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
              </template>
              <template #title="{ row }">
                <v-list-item-title class="text-body-2 px-2">
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
                  <span class="line-height-1 ms-2">{{
                    row.original.title
                  }}</span>
                </v-list-item-title>
              </template>
              <template #dueAt="{ row }">
                <base-date-picker
                  :model-value="row.original.dueAt"
                  @update:model-value="(newValue: string) =>
                  handleUpdateDueDate({
                    card: row.original,
                    newDueDate: newValue,
                  })
                "
                  class="text-caption d-flex flex-fill justify-start rounded-0"
                  label="No due date"
                  @click.prevent
                />
              </template>
              <template #users="{ row }">
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
              </template>
            </table-view-group>
          </suspense>
        </template>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$table-border-color: var(--v-border-color);
$table-border-opacity: var(--v-border-opacity);
$table-row-height: 33px;
$table-header-height: px;
$table-cell-padding-x: 8px;
$table-cell-padding-y: 0;

.table-container {
  position: relative;

  .table {
    max-height: calc(100vh - (40px + 113px));
    // overflow: auto;
    min-width: 100%;
    width: fit-content;
  }

  .column-resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 5px;
    height: 100%;
    cursor: ew-resize;
    z-index: 1;

    > div {
      border-right: 3px solid #2196f3;
      height: 100%;
    }
  }
}
</style>
