<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type Column,
} from '@tanstack/vue-table';
import ListViewGroup from './ListViewGroup.vue';
import type { List, ListGroup, View } from '@tillywork/shared';

const props = defineProps<{
  list: List;
  view: View;
  groups: ListGroup[];
}>();

const expandedState = ref<Record<string, boolean>>();

const table = useVueTable({
  get data() {
    return props.groups;
  },
  columns: [],
  getCoreRowModel: getCoreRowModel(),
  getRowId: (row) => `${row.id}`,
  manualPagination: true,
  manualGrouping: true,
  manualSorting: true,
  enableColumnResizing: false,
  enableSorting: false,
});

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
  <div class="list-view overflow-auto">
    <div
      class="list d-flex flex-column"
      :style="`max-height: calc(100vh - 160px${
        $vuetify.display.mdAndDown ? ' - 40px' : ''
      })`"
    >
      <div class="list-header">
        <template
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <div
            class="list-header-group d-flex border-b-thin border-collapse"
            v-if="false"
          >
            <template v-for="header in headerGroup.headers" :key="header.id">
              <v-hover
                #="{ isHovering: isHeaderHovering, props: headerProps }"
                v-if="false"
              >
                <v-card
                  v-bind="headerProps"
                  class="list-header-cell py-1 px-4 text-caption user-select-none d-flex align-center text-truncate"
                  rounded="0"
                  color="accent"
                  :width="header.getSize()"
                  :height="true ? 0 : 28"
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
                </v-card>
              </v-hover>
            </template>
          </div>
        </template>
      </div>
      <v-card class="list-groups overflow-scroll" rounded="0">
        <template
          v-for="listGroup in table.getCoreRowModel().rows"
          :key="
            'list-group-' +
            listGroup.original.id +
            '-' +
            listGroup.subRows.length
          "
        >
          <list-view-group :list-group="listGroup" :list :view :table />
        </template>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$list-border-color: var(--v-border-color);
$list-border-opacity: var(--v-border-opacity);
$list-row-height: 33px;
$list-header-height: px;
$list-cell-padding-x: 8px;
$list-cell-padding-y: 0;

.list-container {
  position: relative;

  .list {
    min-width: 100%;
    width: fit-content;
  }
}
</style>
