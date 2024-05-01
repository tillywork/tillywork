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
  type ColumnPinningState,
} from '@tanstack/vue-table';
import { ref, watch } from 'vue';
import { computed } from 'vue';
import { type PaginationParams, type QueryFilter } from './types';
import type { CreateCardDto } from '../../cards/types';
import { VTextField, type VForm } from 'vuetify/lib/components/index.mjs';
import { onKeyStroke } from '@vueuse/core';

const props = defineProps<{
  columns: ColumnDef<any, any>[];
  data: unknown[];
  total: number;
  filters?: QueryFilter;
  columnPinning?: ColumnPinningState;
  loading?: boolean;
}>();

const options = defineModel<PaginationParams>('options');
const rowHovered = defineModel<Row<unknown>>('rowHovered');

const emit = defineEmits(['update:options', 'click:row', 'submit', 'load']);
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
    columnPinning: props.columnPinning ?? {},
  },
});

const themeStore = useThemeStore();
const themeClass = computed(() => `v-theme--${themeStore.theme}`);

const cardTitleInput = ref<VTextField | undefined>();
const createCardForm = ref<VForm | undefined>();
const createCardDto = ref<Partial<CreateCardDto>>({
  title: '',
});
const isCreating = ref(false);
const tableElement = ref<HTMLTableElement>();

watch(
  options,
  (newValue) => {
    emit('update:options', newValue);
  },
  { deep: true, immediate: true }
);

onKeyStroke(
  'Escape',
  () => {
    toggleIsCreating(true);
  },
  { target: cardTitleInput.value }
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

function handleHoverChange(row: Row<unknown>, isHovering: boolean) {
  if (isHovering) {
    rowHovered.value = row;
  } else {
    rowHovered.value = undefined;
  }
}

function handleCreateFormSubmit() {
  const cardData = { ...createCardDto.value };
  emit('submit', cardData);
  toggleIsCreating();
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

function toggleIsCreating(closeOnly?: boolean) {
  if (!isCreating.value && closeOnly) return;
  isCreating.value = !isCreating.value;
  createCardForm.value?.reset();
}

function handleInfiniteScrollLoad(scrollObj: any) {
  emit('load', scrollObj);
}
</script>

<template>
  <div class="table-container" :class="themeClass">
    <v-infinite-scroll @load="handleInfiniteScrollLoad" height="300">
      <template #empty></template>
      <table ref="tableElement">
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
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <v-hover
              @update:modelValue="
                (modelValue) => handleHoverChange(row, modelValue)
              "
              #="{ isHovering: isRowHovering, props: rowProps }"
            >
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
            <th
              :colspan="table.getAllColumns().length"
              class="pe-0"
              style="padding-left: 50px"
            >
              <template v-if="!data || data.length === 0">
                <span class="text-caption">No tasks found.</span>
              </template>
              <div class="d-flex align-center ga-2 create-card-wrapper">
                <v-form
                  v-if="isCreating"
                  ref="createCardForm"
                  class="w-100"
                  @submit.prevent="handleCreateFormSubmit"
                >
                  <v-text-field
                    v-model="createCardDto.title"
                    ref="cardTitleInput"
                    autofocus
                    variant="outlined"
                    color="default"
                    label="Card title"
                    hide-details
                    single-line
                  >
                    <template #append>
                      <div class="d-flex align-center ga-2">
                        <v-btn
                          color="default"
                          variant="outlined"
                          size="small"
                          rounded="md"
                          @click="toggleIsCreating()"
                          >Cancel</v-btn
                        >
                        <v-btn type="submit" size="small" rounded="md"
                          >Save</v-btn
                        >
                      </div>
                    </template>
                  </v-text-field>
                </v-form>
                <template v-else>
                  <v-btn
                    variant="text"
                    prepend-icon="mdi-plus"
                    size="small"
                    class="flex-0-0-100 justify-start text-capitalize"
                    @click="toggleIsCreating()"
                    rounded="0"
                    color="default"
                    >Add task</v-btn
                  >
                </template>
              </div>
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
$table-row-height: 33px;
$table-header-height: 33px;
$table-cell-padding-x: 8px;
$table-cell-padding-y: 0;

.table-container {
  position: relative;

  table {
    min-width: max-content;
    border-spacing: 0;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    font-size: 0.875rem;
    table-layout: fixed;
    border-collapse: collapse;
    position: relative;

    > thead > tr:not(.loading) > th:not(:first-child),
    > tbody > tr > td:not(:first-child),
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
