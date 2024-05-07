<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
  type Header,
  type Column,
  type ColumnPinningState,
} from '@tanstack/vue-table';
import { computed } from 'vue';
import { type PaginationParams, type QueryFilter } from './types';

const props = defineProps<{
  columns: ColumnDef<any, any>[];
  data: unknown[];
  total: number;
  filters?: QueryFilter;
  columnPinning?: ColumnPinningState;
  loading?: boolean;
  noHeaders?: boolean;
}>();

const options = defineModel<PaginationParams>('options');
const rowHovered = defineModel<Row<unknown>>('rowHovered');

const emit = defineEmits(['update:options', 'click:row', 'submit', 'load']);
const slots = defineSlots();

const table = useVueTable({
  get data() {
    return props.data;
  },
  columns: props.columns as ColumnDef<unknown>[],
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  columnResizeMode: 'onChange',
  manualSorting: true,
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
    columnPinning: props.columnPinning ?? {},
  },
});

const themeStore = useThemeStore();
const themeClass = computed(() => `v-theme--${themeStore.theme}`);

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

function handleHoverChange(row: Row<unknown>, isHovering: boolean) {
  console.log(row);
  if (isHovering) {
    rowHovered.value = row;
  } else {
    rowHovered.value = undefined;
  }
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

function handleInfiniteScrollLoad(scrollObj: any) {
  emit('load', scrollObj);
}
</script>

<template>
  <div class="table-container" :class="themeClass">
    <v-infinite-scroll @load="handleInfiniteScrollLoad" max-height="300">
      <template #empty></template>
      <table>
        <thead>
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <template v-for="header in headerGroup.headers" :key="header.id">
              <v-hover #="{ isHovering: isHeaderHovering, props: headerProps }">
                <th
                  v-bind="!noHeaders ? headerProps : undefined"
                  :colSpan="header.colSpan"
                  :style="`width: ${header.getSize()}px; ${
                    isHeaderHovering ? 'cursor: pointer;' : ''
                  }; ${noHeaders ? 'height: 0px !important;' : ''}`"
                  :class="isHeaderHovering ? 'bg-surface' : ''"
                  @click="handleSortingChange(header)"
                  class="text-caption"
                >
                  <!-- Header Content -->
                  <template v-if="!noHeaders">
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
                  </template>
                </th>
              </v-hover>
            </template>
          </tr>
          <tr class="loading position-relative">
            <th :colspan="table.getAllColumns().length">
              <v-progress-linear
                v-if="loading"
                active
                color="primary"
                height="2"
                indeterminate
                absolute
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="row in table.getRowModel().rows"
            :key="JSON.stringify(row.original)"
          >
            <v-hover
              @update:modelValue="
                (modelValue) => handleHoverChange(row, modelValue)
              "
              #="{ isHovering: isRowHovering, props: rowProps }"
            >
              <tr
                v-bind="rowProps"
                @click="handleRowClick(row)"
                :class="isRowHovering ? 'bg-accent cursor-pointer' : ''"
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
            <th
              :colspan="table.getAllColumns().length"
              class="pe-0"
              style="padding-left: 50px"
            >
              <template v-if="!data || data.length === 0">
                <span class="text-caption">No tasks found.</span>
              </template>
            </th>
          </tr>
        </tfoot>
      </table>
    </v-infinite-scroll>
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

  table {
    width: 100%;
    border-spacing: 0;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    font-size: 0.875rem;
    table-layout: fixed;
    position: relative;

    > thead > tr:not(.loading) > th,
    > tbody > tr > td,
    > tbody > tr:not(.loading) > th {
      border-bottom: thin solid rgba($table-border-color, $table-border-opacity);
    }

    > tbody > tr > td,
    > thead > tr > td,
    > tfoot > tr > td {
      height: $table-row-height;
    }

    > thead > tr:not(.loading) > th {
      position: relative;
      height: $table-header-height;
      font-weight: 500;
      user-select: none;
      text-align: start;
    }

    > tbody > tr > td,
    > tbody > tr > th,
    > thead > tr > td,
    > thead > tr:not(.loading) > th,
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

<style lang="scss">
$v-field-input-x-padding: 8px;
$v-field-input-font-size: 14px;

.table-container {
  .v-infinite-scroll {
    display: block;
    // min-width: max-content;

    .v-infinite-scroll__side {
      padding: 0;
    }
  }
}

.create-card-wrapper {
  .v-field__input {
    min-height: 30px;
    padding-inline: $v-field-input-x-padding;
    padding-top: var(--v-field-input-padding-top) - 10;
    padding-bottom: var(--v-field-input-padding-bottom) - 10;
    font-size: $v-field-input-font-size;
  }

  .v-label.v-field-label {
    margin-inline-start: $v-field-input-x-padding - 2;
    margin-inline-end: $v-field-input-x-padding - 2;
    font-size: $v-field-input-font-size;
  }
}
</style>
