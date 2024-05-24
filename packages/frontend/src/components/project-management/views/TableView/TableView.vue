<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
  type Column,
  getGroupedRowModel,
} from '@tanstack/vue-table';
import { type PaginationParams, type QueryFilter } from './types';
import type { View } from '../types';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import type { Card } from '../../cards/types';
import {
  type ListGroup,
  ListGroupOptions,
  type ListStage,
} from '../../lists/types';
import { DIALOGS } from '@/components/common/dialogs/types';
import { useDialog } from '@/composables/useDialog';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import { useAuthStore } from '@/stores/auth';
import type { ProjectUser } from '@/components/common/projects/types';

const options = defineModel<PaginationParams>('options');
const rowHovered = defineModel<Row<ListGroup>>('rowHovered');

const props = defineProps<{
  columns: ColumnDef<ListGroup, Card>[];
  filters?: QueryFilter;
  loading?: boolean;
  noHeaders?: boolean;
  view: View;
  groups: ListGroup[];
  fixedHeaders?: boolean;
}>();

const emit = defineEmits(['update:options', 'click:row', 'submit', 'load']);
const slots = defineSlots();

const dialog = useDialog();
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

const tableData = ref<ListGroup[]>([]);

watch(
  () => props.groups,
  (v) => {
    if (v) {
      const tableGroups = v.map((listGroup) => ({
        ...listGroup,
        subRows: listGroup.cards ? [...listGroup.cards.cards] : [],
      }));
      tableData.value = [...tableGroups];
    }
  },
  { immediate: true }
);

const table = useVueTable({
  get data() {
    return tableData.value;
  },
  columns: props.columns as ColumnDef<ListGroup, any>[],
  getCoreRowModel: getCoreRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getSubRows: (row) => row.cards?.cards as any[],
  manualPagination: true,
  manualGrouping: true,
  manualSorting: true,
  columnResizeMode: 'onChange',
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
            : true,
      },
    ],
  },
});

function handleRowClick(row: Row<ListGroup>) {
  emit('click:row', row);
}

function handleHoverChange(row: Row<ListGroup>, isHovering: boolean) {
  if (isHovering) {
    rowHovered.value = row;
  } else {
    rowHovered.value = undefined;
  }
}

function getColumnSortIcon(column: Column<ListGroup, unknown>) {
  switch (column.getIsSorted()) {
    case 'desc':
      return 'mdi-arrow-down';
    case 'asc':
    default:
      return 'mdi-arrow-up';
  }
}

function openCreateCardDialog(listGroup: ListGroup) {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_CARD,
    data: {
      listId: props.view.listId,
      listStage: getCurrentStage(listGroup),
      users: getCurrentAssignee(listGroup),
    },
  });
}

function toggleGroupExpansion(listGroup: ListGroup) {
  listGroup.isExpanded = true;

  updateListGroup(listGroup);
}

function getCurrentStage(group: ListGroup) {
  let stage: ListStage | undefined;

  if (group.type === ListGroupOptions.LIST_STAGE) {
    stage = listStages.value?.find((stage) => {
      return stage.id == group.entityId;
    });
  }

  return stage ? { ...stage } : undefined;
}

function getCurrentAssignee(group: ListGroup) {
  let user: ProjectUser | undefined;

  if (group.type === ListGroupOptions.ASSIGNEES && projectUsers.value) {
    user = projectUsers.value.find((user: ProjectUser) => {
      return user.user.id == group.entityId;
    });
  }

  return user ? [{ ...user }] : undefined;
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
      <v-card class="table-groups overflow-scroll" height="calc(100vh - 64px)">
        <template
          v-for="listGroup in table.getGroupedRowModel().rows"
          :key="
            'table-group-' +
            listGroup.original.id +
            '-' +
            listGroup.subRows.length
          "
        >
          <v-card color="transparent" class="table-group" rounded="0">
            <v-banner sticky lines="one" border="none" bg-color="accent">
              <v-btn
                variant="text"
                density="comfortable"
                size="small"
                :icon="
                  listGroup.original.isExpanded
                    ? 'mdi-chevron-down'
                    : 'mdi-chevron-right'
                "
                :color="listGroup.original.isExpanded ? 'info' : 'default'"
                class="me-2"
                @click="toggleGroupExpansion(listGroup.original)"
              />
              <div>
                <template
                  v-if="listGroup.original.type === ListGroupOptions.ASSIGNEES"
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
                <v-chip
                  rounded="md"
                  density="comfortable"
                  :color="listGroup.original.color"
                  class="ms-3"
                >
                  {{ listGroup.original.name }}
                  <template #append>
                    <span class="text-caption ms-4 font-weight-bold">
                      {{ listGroup.original.cards?.total }}
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
            <v-list
              class="pa-0 overflow-scroll"
              rounded="0"
              height="max-content"
              max-height="330"
              :nav="false"
            >
              <template
                v-for="row in listGroup.subRows"
                :key="'table-row-' + row.original.id"
              >
                <v-list-item class="pa-0" rounded="0" height="33">
                  <v-hover
                    @update:modelValue="
                      (modelValue) => handleHoverChange(row, modelValue)
                    "
                    #="{ isHovering: isRowHovering, props: rowProps }"
                  >
                    <v-card
                      v-bind="rowProps"
                      @click="handleRowClick(row)"
                      link
                      height="33"
                      class="table-row d-flex align-center text-body-2"
                      rounded="0"
                    >
                      <v-card
                        v-for="cell in row.getVisibleCells()"
                        :key="cell.id"
                        class="table-cell d-flex align-center fill-height"
                        :width="cell.column.getSize()"
                        rounded="0"
                        color="transparent"
                        link
                      >
                        <!-- Check for named slot that matches columnId, and use template to define slot content -->
                        <template
                          v-if="
                            cell.column.columnDef.id &&
                            !!slots[cell.column.columnDef.id]
                          "
                        >
                          <slot
                            :name="cell.column.columnDef.id"
                            v-bind="cell.getContext()"
                          ></slot>
                        </template>
                        <!-- Default rendering if no slot is provided -->
                        <template v-else>
                          <FlexRender
                            :render="cell.column.columnDef.cell"
                            :props="cell.getContext()"
                          />
                        </template>
                      </v-card>
                    </v-card>
                  </v-hover>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </template>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$table-border-color: var(--v-border-color);
$table-border-opacity: var(--v-border-opacity);
$table-row-height: 36px;
$table-header-height: 33px;
$table-cell-padding-x: 8px;
$table-cell-padding-y: 0;

.table-container {
  position: relative;

  .table {
    max-height: calc(100vh - (40px + 113px));
    overflow: auto;
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
