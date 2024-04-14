<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
} from '@tanstack/vue-table'
import { watch } from 'vue';
import { computed } from 'vue';

export interface PaginationParams {
  page?: number
  itemsPerPage?: number
  sortBy?: string
  sortOrder?: 'desc' | 'asc'
}

const props = defineProps<{
  columns: ColumnDef<any, any>[]
  data: unknown[]
  total: number
}>()

const options = defineModel<PaginationParams>('options')

const emit = defineEmits(['update:options']);

const pageCount = computed(() => {
  if (!options.value) {
    return -1;
  }
  return Math.ceil(props.total / (options.value?.itemsPerPage ?? 10))
})

const table = useVueTable({
  get data() {
    return props.data
  },
  columns: props.columns as ColumnDef<unknown>[],
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  rowCount: props.total,
  pageCount: pageCount.value,
})

const themeStore = useThemeStore();
const themeClass = computed(() => `v-theme--${themeStore.theme}`);

const pageSizeDropdownOptions = [1, 5, 10, 25, 50];
watch(options, (newValue) => {
  emit('update:options', newValue);
}, { deep: true })

function updateItemsPerPage(newValue: number) {
  if (options.value) {
    options.value.itemsPerPage = newValue
  }
}
</script>

<template>
  <div class="v-table v-table--has-top v-table--has-bottom v-table--density-compact v-data-table rounded border"
    :class="themeClass">
    <div class="v-table__wrapper">
      <table>
        <thead class="v-data-table__thead">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id" :colSpan="header.colSpan"
              class="v-data-table__td v-data-table-column--no-padding v-data-table__th font-weight-bold">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                :props="header.getContext()" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th :colspan="table.getAllColumns().length" class="py-2">
              <div class="d-flex justify-end align-center" v-if="options?.itemsPerPage">
                <v-btn id="page-size-dropdown-activator" color="default" variant="text">{{ options.itemsPerPage
                  }}</v-btn>
                <v-pagination v-model="options.page" :length="pageCount" rounded density="compact"
                  total-visible="5"></v-pagination>
              </div>

              <v-menu activator="#page-size-dropdown-activator">
                <v-list density="compact">
                  <v-list-item v-for="item in pageSizeDropdownOptions" :key="item" :value="item" :title="item"
                    density="compact" @click="updateItemsPerPage(item)">
                  </v-list-item>
                </v-list>
              </v-menu>
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>