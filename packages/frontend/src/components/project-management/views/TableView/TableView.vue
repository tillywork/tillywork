<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type Column,
} from '@tanstack/vue-table';
import { type List, type ListGroup } from '../../lists/types';
import { useListStagesService } from '@/services/useListStagesService';
import { useProjectUsersService } from '@/services/useProjectUsersService';
import TableViewGroup from './TableViewGroup.vue';
import { useAuthStore } from '@/stores/auth';
import { useFields } from '@/composables/useFields';
import type { TableColumnDef } from './types';
import { type View } from '@tillywork/shared';

const isLoading = defineModel<boolean>('loading');

const props = defineProps<{
  list: List;
  view: View;
  groups: ListGroup[];
}>();

const expandedState = ref<Record<string, boolean>>();

const { titleField, fields, sortFieldsByViewColumns } = useFields({
  cardTypeId: props.list.defaultCardType.id,
  listId: props.list.id,
});

const viewColumnIds = computed(() =>
  props.view.options.columns?.map((columnId) => columnId)
);

const columns = computed<TableColumnDef[]>(() => {
  const actionsColumn: TableColumnDef = {
    id: 'actions',
    enableResizing: false,
    enableSorting: false,
    size: 50,
    cellType: 'actions',
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

  const viewColumns: TableColumnDef[] = sortFieldsByViewColumns(
    fields.value.filter((field) =>
      viewColumnIds.value?.includes(field.id.toString())
    ),
    viewColumnIds.value ?? []
  ).map((field) => ({
    id: `data.${field.slug}`,
    accessorKey: `data.${field.slug}`,
    header: field.name,
    size: 150,
    minSize: 100,
    cellType: field.type,
    field,
  }));

  return [actionsColumn, titleColumn, ...viewColumns];
});

const { project } = storeToRefs(useAuthStore());

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
  get columns() {
    return columns.value;
  },
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
</script>

<template>
  <div class="table-view mx-6 position-relative overflow-auto">
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
                  height="33"
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
            :list
            :view
            :project-users="projectUsers ?? []"
            :table
            :column-sizes="columnSizes"
            :no-group-banners="noGroupBanners"
          />
        </template>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss">
$table-border-color: var(--v-border-color);
$table-border-opacity: var(--v-border-opacity);

.table-view {
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

    .table-header-cell,
    .table-cell {
      border-inline-end: 0.25px solid
        rgba(var(--v-border-color), var(--v-border-opacity));
    }

    .table-row {
      border-bottom: 0.25px solid
        rgba(var(--v-border-color), var(--v-border-opacity));
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
