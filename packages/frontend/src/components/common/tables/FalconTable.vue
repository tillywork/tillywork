<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
  type Header,
  type SortingState,
  type Column,
} from '@tanstack/vue-table';
import { watch } from 'vue';
import { computed } from 'vue';

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
  sort?: TableSortState;
}

export interface TableSortOption {
  key: string;
  order: string;
}

export type TableSortState = TableSortOption[];

const props = defineProps<{
  columns: ColumnDef<any, any>[];
  data: unknown[];
  total: number;
}>();

const options = defineModel<PaginationParams>('options');

const emit = defineEmits(['update:options', 'click:row']);
const slots = defineSlots();

const pageCount = computed(() => {
  if (!options.value) {
    return -1;
  }
  return Math.ceil(props.total / (options.value?.itemsPerPage ?? 10));
});

const tanstackSortState = computed(() => {
  const sortState: SortingState = [];
  if (options.value && options.value.sort) {
    options.value?.sort.forEach((sortOption) =>
      sortState.push({
        id: sortOption.key,
        desc: sortOption.order === 'desc',
      })
    );
  }

  return sortState;
});

const table = useVueTable({
  get data() {
    return props.data;
  },
  columns: props.columns as ColumnDef<unknown>[],
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  rowCount: props.total,
  pageCount: pageCount.value,
  columnResizeMode: 'onChange',
  manualSorting: true,
  initialState: {
    sorting: tanstackSortState.value,
  },
});

const themeStore = useThemeStore();
const themeClass = computed(() => `v-theme--${themeStore.theme}`);

const pageSizeDropdownOptions = [1, 5, 10, 25, 50];
watch(
  options,
  (newValue) => {
    emit('update:options', newValue);
  },
  { deep: true }
);

function handleSortingChange(header: Header<unknown, unknown>) {
  if (options.value && header.column.getCanSort()) {
    header.column.toggleSorting();
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
  emit('click:row', row);
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
</script>

<template>
  <div class="table-container" :class="themeClass">
    <table>
      <thead>
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <template v-for="header in headerGroup.headers" :key="header.id">
            <v-hover #="{ isHovering: isHeaderHovering, props: headerProps }">
              <th
                v-bind="headerProps"
                :colSpan="header.colSpan"
                :style="`width: ${header.getSize()}px; ${
                  isHeaderHovering ? 'cursor: pointer;' : ''
                }`"
                :class="isHeaderHovering ? 'bg-surface' : ''"
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
                      header.column.getIsSorted() === false ? 'grey' : undefined
                    "
                  >
                    {{ getColumnSortIcon(header.column) }}
                  </v-icon>
                </template>
                <!-- Column Resizer -->
                <template v-if="header.column.getCanResize()">
                  <v-hover
                    #="{ isHovering: isResizeHovering, props: resizeProps }"
                  >
                    <div v-bind="resizeProps" class="column-resizer">
                      <div
                        @mousedown="header.getResizeHandler()?.($event)"
                        @touchstart="header.getResizeHandler()?.($event)"
                        v-show="
                          isResizeHovering || header.column.getIsResizing()
                        "
                        @click.stop
                      >
                        &nbsp;
                      </div>
                      &nbsp;
                    </div>
                  </v-hover>
                </template>
              </th>
            </v-hover>
          </template>
        </tr>
      </thead>
      <tbody>
        <template v-for="row in table.getRowModel().rows" :key="row.id">
          <v-hover #="{ isHovering: isRowHovering, props: rowProps }">
            <tr
              v-bind="rowProps"
              @click="handleRowClick(row)"
              :class="isRowHovering ? 'bg-surface cursor-pointer' : ''"
            >
              <td v-for="cell in row.getVisibleCells()" :key="cell.id">
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
              </td>
            </tr>
          </v-hover>
        </template>
      </tbody>
      <tfoot>
        <tr>
          <th :colspan="table.getAllColumns().length" class="py-2">
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
          </th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style lang="scss" scoped>
$table-border-color: var(--v-border-color);
$table-border-opacity: var(--v-border-opacity);
$table-row-height: 36px;
$table-header-height: 40px;
$table-cell-padding-x: 16px;
$table-cell-padding-y: 0;

.table-container {
  width: 100%;
  overflow-x: auto;

  table {
    border-spacing: 0;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    font-size: 0.875rem;
    table-layout: fixed;
    border-collapse: collapse;
    position: relative;

    > thead > tr > th,
    > tbody > tr:not(:last-child) > td,
    > tbody > tr:not(:last-child) > th {
      border-bottom: thin solid rgba($table-border-color, $table-border-opacity);
    }

    > tbody > tr > td,
    > thead > tr > td,
    > tfoot > tr > td {
      height: $table-row-height;
    }

    > thead > tr > th {
      position: relative;
      height: $table-header-height;
      font-weight: 500;
      user-select: none;
      text-align: start;
    }

    > tbody > tr > td,
    > tbody > tr > th,
    > thead > tr > td,
    > thead > tr > th,
    > tfoot > tr > td,
    > tfoot > tr > th {
      padding: $table-cell-padding-y $table-cell-padding-x;
      transition-duration: 0.28s;
      transition-property: box-shadow, opacity, background, height;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    // For truncating text, doesn't work without max-width: 0;
    > tbody > tr > td {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 0;
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
