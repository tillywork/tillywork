<script setup lang="ts">
import {
  getCoreRowModel,
  useVueTable,
  type Column,
  type ColumnDef,
  type Header,
  type Row,
  FlexRender,
  getSortedRowModel,
} from '@tanstack/vue-table';
import type { PaginationParams, TableSortOption } from './types';

const props = defineProps<{
  columns?: ColumnDef<any, any>[];
  data: any[];
  total?: number;
  sortBy?: TableSortOption[];
  enableColumnResizing?: boolean;
  width?: string;
}>();

const emit = defineEmits(['update:options', 'click:row']);
const slots = defineSlots();

const options = defineModel<PaginationParams>('options');

const sortBy = computed<TableSortOption[]>(() => props.sortBy ?? []);
const tableSortState = computed(() =>
  sortBy.value?.map((sortOption) => {
    return { id: sortOption.key, desc: sortOption.order === 'desc' };
  })
);

const pageCount = computed(() => {
  if (!options.value) {
    return -1;
  }
  return Math.ceil(
    (props.total ?? props.data.length) / (options.value?.itemsPerPage ?? 10)
  );
});

const table = useVueTable({
  get data() {
    return props.data;
  },
  columns: generateColumnDefs(),
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  manualPagination: props.total ? true : false,
  rowCount: props.total ? props.total : undefined,
  pageCount: pageCount.value,
  columnResizeMode: 'onChange',
  enableColumnResizing: props.enableColumnResizing,
  manualSorting: props.total ? true : false,
  initialState: {
    sorting: tableSortState.value,
  },
});

const pageSizeDropdownOptions = [1, 5, 10, 25, 50];

watch(
  options,
  (newValue) => {
    emit('update:options', newValue);
  },
  { deep: true }
);

function handleSortingChange(header: Header<unknown, unknown>) {
  if (header.column.getCanSort()) {
    header.column.toggleSorting();
  }

  if (options.value) {
    if (header.column.getIsSorted() !== false) {
      options.value.sort = [
        {
          key: header.column.id,
          order: header.column.getIsSorted() as string,
        },
      ];
    } else {
      options.value.sort = options.value.sort?.filter(
        (sortOption) => sortOption.key !== header.column.id
      );
    }
  }
}

function handleRowClick(row: Row<unknown>) {
  emit('click:row', row.original);
}

function getColumnSortIcon(column: Column<unknown, unknown>) {
  switch (column.getIsSorted()) {
    case 'desc':
      return 'mdi-arrow-down';
    case 'asc':
    default:
      return 'mdi-arrow-up';
  }
}

/**
 * Returns incoming columns prop or
 * generate column definition based on
 * incoming data.
 */
function generateColumnDefs(): ColumnDef<any, any>[] {
  if (props.columns) {
    return props.columns;
  }

  const data = props.data;

  if (data.length === 0) return [];
  // Extract unique keys from the data objects
  const keys = Array.from(new Set(data.flatMap((item) => Object.keys(item))));
  return keys.map((key) => ({
    id: key,
    accessorKey: key,
    header: key[0].toUpperCase() + key.slice(1), // Capitalize the column headers
    cell: (info) => info.getValue(),
  }));
}
</script>

<template>
  <div class="table-container position-relative overflow-hidden">
    <v-card
      class="table d-flex flex-column my-2"
      :width="width ?? '100%'"
      border="thin"
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
                  @click="handleSortingChange(header)"
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
      <v-list
        class="table-body overflow-scroll pa-0"
        rounded="0"
        :lines="false"
      >
        <template v-for="row in table.getSortedRowModel().rows" :key="row.id">
          <v-list-item class="pa-0" rounded="0" height="33" :ripple="false">
            <v-hover #="{ isHovering: isRowHovering, props: rowProps }">
              <v-card
                color="transparent"
                v-bind="rowProps"
                height="33"
                class="table-row d-flex align-center text-body-3 flex-fill"
                rounded="0"
                link
                :ripple="false"
                @click="handleRowClick(row)"
              >
                <template v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <v-card
                    :width="cell.column.getSize()"
                    class="table-cell d-flex align-center fill-height px-4"
                    rounded="0"
                    color="transparent"
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
                    <template v-else>
                      <FlexRender
                        :render="cell.column.columnDef.cell"
                        :props="cell.getContext()"
                      />
                    </template>
                  </v-card>
                </template>
              </v-card>
            </v-hover>
          </v-list-item>
        </template>
      </v-list>
      <v-card class="table-footer">
        <div
          class="d-flex justify-end align-center ga-3"
          v-if="options?.itemsPerPage"
        >
          <span class="font-weight-medium">Items per page:</span>
          <div class="w-100px">
            <v-select
              v-model="options.itemsPerPage"
              :items="pageSizeDropdownOptions"
              single-line
              variant="outlined"
              density="compact"
              hide-details
            />
          </div>
          <v-pagination
            v-model="options.page"
            :length="pageCount"
            rounded
            density="compact"
            total-visible="5"
            show-first-last-page
          ></v-pagination>
        </div>
      </v-card>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.table {
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

  .table-cell:not(:last-of-type),
  .table-header-cell:not(:last-of-type) {
    border-inline-end-width: thin !important;
    border-inline-end-style: solid !important;
    border-inline-end-color: rgba(
      var(--v-border-color),
      var(--v-border-opacity)
    ) !important;
  }

  .table-row {
    border-bottom: 0.25px solid
      rgba(var(--v-border-color), var(--v-border-opacity));

    .table-cell {
      overflow: hidden;
    }
  }
}
</style>
