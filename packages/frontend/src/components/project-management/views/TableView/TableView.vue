<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
  type Column,
} from '@tanstack/vue-table';
import { type View } from '../types';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import type { Card } from '../../cards/types';
import { type ListGroup } from '../../lists/types';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import TableViewGroup from './TableViewGroup.vue';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAuthStore } from '@/stores/auth';

const isLoading = defineModel<boolean>('loading');

const props = defineProps<{
  columns: ColumnDef<ListGroup, any>[];
  view: View;
  groups: ListGroup[];
}>();

const emit = defineEmits([
  'row:delete',
  'submit',
  'load',
  'row:update:stage',
  'row:update:due-date',
  'row:update:assignees',
  'row:update:order',
]);

const expandedState = ref<Record<string, boolean>>();

const { showSnackbar } = useSnackbarStore();
const { project } = storeToRefs(useAuthStore());

const listGroupsService = useListGroupsService();
const { mutateAsync: updateListGroup } =
  listGroupsService.useUpdateListGroupMutation();

const listsStagesService = useListStagesService();
const { data: listStages } = listsStagesService.useGetListStagesQuery({
  listId: props.view.listId,
});

const projectUsersService = useProjectUsersService();
const { data: projectUsers } = projectUsersService.useProjectUsersQuery({
  projectId: project.value!.id,
});

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
  enableSorting: false,
});

const columnSizes = computed(() => {
  const sizes = table.getAllColumns().map((column) => {
    return {
      id: column.id,
      size: column.getSize(),
    };
  });

  return sizes;
});

const noGroupBanners = computed(() => props.groups.length < 2);

watchEffect(() => {
  const { groups } = props;
  if (groups) {
    const state: Record<string, boolean> = {};
    groups.forEach((listGroup) => {
      state[listGroup.id] = listGroup.isExpanded ?? false;
    });
    expandedState.value = state;
    table.setExpanded(expandedState.value);
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

function handleUpdateAssignees({ users, card }: { users: User[]; card: Card }) {
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

function handleUpdateCardOrder(data: {
  currentCard: Card;
  previousCard?: Card;
  nextCard?: Card;
}) {
  emit('row:update:order', data);
}
</script>

<template>
  <div class="table-container px-6 position-relative overflow-auto">
    <div
      class="table d-flex flex-column my-2"
      :style="`max-height: calc(100vh - 180px${
        $vuetify.display.mdAndDown ? ' - 56px' : ''
      })`"
    >
      <div class="table-header">
        <template
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <div
            class="table-header-group d-flex border-b-thin border-collapse bg-accent"
          >
            <template v-for="header in headerGroup.headers" :key="header.id">
              <v-hover #="{ isHovering: isHeaderHovering, props: headerProps }">
                <v-card
                  v-bind="headerProps"
                  class="table-header-cell py-1 px-4 text-caption user-select-none d-flex align-center text-truncate"
                  rounded="0"
                  color="accent"
                  :width="header.getSize()"
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
      <v-card class="table-groups overflow-scroll" rounded="0">
        <template
          v-for="listGroup in table.getCoreRowModel().rows"
          :key="
            'table-group-' +
            listGroup.original.id +
            '-' +
            listGroup.subRows.length
          "
        >
          <table-view-group
            v-model:loading="isLoading"
            :list-group="listGroup"
            :list-stages="listStages ?? []"
            :view
            :project-users="projectUsers ?? []"
            :table
            :column-sizes="columnSizes"
            :no-group-banners="noGroupBanners"
            @toggle:group="toggleGroupExpansion"
            @row:delete="handleDeleteCard"
            @row:update:stage="handleUpdateCardStage"
            @row:update:due-date="handleUpdateDueDate"
            @row:update:assignees="handleUpdateAssignees"
            @row:update:order="handleUpdateCardOrder"
          />
        </template>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$table-border-color: var(--v-border-color);
$table-border-opacity: var(--v-border-opacity);

.table-container {
  .table {
    max-height: calc(100vh - 180px);
    min-width: 100%;
    width: fit-content;
    border: 0.25px solid rgba($table-border-color, $table-border-opacity);
    border-radius: 4px;
    overflow: hidden;

    .table-header {
      border-bottom: 0.25px solid
        rgba($table-border-color, $table-border-opacity);
    }
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
