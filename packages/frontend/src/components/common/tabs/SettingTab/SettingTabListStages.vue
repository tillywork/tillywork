<template>
  <v-card min-width="500">
    <v-card-title class="d-flex align-center">
      List Stages
      <base-icon-btn class="ms-4" @click="openDialogUpsert('Add')" />
    </v-card-title>
    <v-card-subtitle>
      <strong class="text-red">TODO</strong>
      Please Provide Concise Description!
    </v-card-subtitle>
    <v-card-text>
      <v-list class="pa-0 overflow-scroll" rounded="0" :lines="false">
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
        <draggable
          v-model="draggableListStages"
          @update="onDragUpdate"
          item-key="id"
          animation="100"
          ghost-class="v-list-item--active"
        >
          <template #item="{ element: row }">
            <v-list-item class="pa-0" rounded="0" height="33" :ripple="false">
              <v-hover #="{ isHovering: isRowHovering, props: rowProps }">
                <v-card
                  color="transparent"
                  v-bind="rowProps"
                  height="33"
                  class="table-row d-flex align-center text-body-2 flex-fill"
                  rounded="0"
                  link
                  :ripple="false"
                >
                  <template
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                  >
                    <template v-if="cell.column.columnDef.id === 'actions'">
                      <v-card
                        :width="getColumnSize(cell.column.columnDef.id)"
                        class="table-cell d-flex align-center fill-height"
                        rounded="0"
                        color="transparent"
                      >
                        <div
                          class="d-flex flex-fill justify-end ga-1"
                          v-if="isRowHovering || rowMenuOpen?.id === row.id"
                        >
                          <v-menu
                            @update:model-value="
                              (v) => handleRowTableMenuClick({ row, isOpen: v })
                            "
                          >
                            <template #activator="{ props }">
                              <base-icon-btn
                                v-bind="props"
                                icon="mdi-dots-vertical"
                                @click.prevent
                              />
                            </template>
                            <v-card class="border-thin">
                              <v-list>
                                <v-list-item
                                  @click="
                                    openDialogUpsert('Edit', row.original)
                                  "
                                >
                                  <template #prepend>
                                    <v-icon size="x-small" icon="mdi-pencil" />
                                  </template>
                                  <v-list-item-title>Edit</v-list-item-title>
                                </v-list-item>
                                <v-list-item
                                  class="text-error"
                                  @click="openDialogRemove(row.original)"
                                >
                                  <template #prepend>
                                    <v-icon size="x-small" icon="mdi-delete" />
                                  </template>
                                  <v-list-item-title>Delete</v-list-item-title>
                                </v-list-item>
                              </v-list>
                            </v-card>
                          </v-menu>
                          <base-icon-btn
                            class="cursor-grab"
                            icon="mdi-cursor-move"
                            variant="text"
                          />
                        </div>
                      </v-card>
                    </template>
                    <template v-else>
                      <v-card
                        :width="getColumnSize(cell.column.columnDef.id)"
                        class="table-cell d-flex align-center fill-height"
                        rounded="0"
                        color="transparent"
                      >
                        <FlexRender
                          :render="cell.column.columnDef.cell"
                          :props="cell.getContext()"
                        />
                      </v-card>
                    </template>
                  </template>
                </v-card>
              </v-hover>
            </v-list-item>
          </template>
        </draggable>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { DIALOGS } from '../../dialogs/types';
import { useDialogStore } from '@/stores/dialog';
import { useListStagesService } from '@/composables/services/useListStagesService';
import type {
  List,
  ListStage,
} from '@/components/project-management/lists/types';
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
} from '@tanstack/vue-table';
import draggable from 'vuedraggable';

// Dialog
const dialog = useDialogStore();
const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.SETTINGS)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);
const dataTab = computed<{ list: Ref<List> }>(
  () => currentDialog.value.data?.dataTab
);
function openDialogUpsert(mode: 'Add' | 'Edit', listStage?: ListStage) {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_LIST_STAGE,
    data: {
      mode,
      listStage: {
        ...listStage,
        listId: listId.value,
      },
    },
  });
}
function openDialogRemove(listStage: ListStage) {
  dialog.openDialog({
    dialog: DIALOGS.REMOVE_LIST_STAGE,
    data: {
      listStages: listStages.value,
      listStage,
    },
  });
}

// Core
const listId = computed<number>(() => {
  if (dataTab.value) {
    const list = toValue(dataTab.value.list);
    return list.id;
  }

  // NOTE: If we are accessing `Setting` dialog directly, how do we retrieve the `listId`?
  return 3; // TODO: Implement Get Current/Selected ListId
});
const { useGetListStagesQuery } = useListStagesService();
const { data: listStages } = useGetListStagesQuery(listId.value);

// Table
const columns = ref<ColumnDef<ListStage, any>[]>([
  {
    id: 'actions',
    enableResizing: false,
    enableSorting: false,
    size: 80,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'color',
    accessorKey: 'color',
    header: 'Color',
  },
  {
    id: 'isCompleted',
    accessorKey: 'isCompleted',
    header: 'Is Completed?',
  },
]);
const table = useVueTable({
  get data() {
    return listStages.value || [];
  },
  columns: columns.value,
  getCoreRowModel: getCoreRowModel(),
  getRowId: (row) => `${row.id}`,
  manualPagination: true,
  manualGrouping: true,
  manualSorting: true,
  columnResizeMode: 'onChange',
});
function getColumnSize(columnId: string) {
  const sizes = table.getAllColumns().map((column) => {
    return {
      id: column.id,
      size: column.getSize(),
    };
  });

  const columnSize = sizes.find((cs) => cs.id === columnId);
  return columnSize?.size;
}
const rowMenuOpen = ref<Row<ListStage> | null>();
function handleRowTableMenuClick({
  row,
  isOpen,
}: {
  row: Row<ListStage>;
  isOpen: boolean;
}) {
  if (isOpen) {
    rowMenuOpen.value = row;
  } else {
    rowMenuOpen.value = null;
  }
}

// Reorder Functionality
// Draggable
const draggableListStages = ref(table.getCoreRowModel().rows);

watch(
  listStages,
  (v) => {
    if (v) {
      draggableListStages.value = table.getCoreRowModel().rows;
    }
  },
  { immediate: true }
);

function onDragUpdate(event: any) {
  const { newIndex } = event;

  const previousData = draggableListStages.value[newIndex - 1]?.original;
  const currentData = draggableListStages.value[newIndex]?.original;
  const nextData = draggableListStages.value[newIndex + 1]?.original;

  handleUpdateListStageOrder({
    currentData,
    previousData,
    nextData,
  });
}
function handleUpdateListStageOrder(data: {
  currentData: ListStage;
  previousData?: ListStage;
  nextData?: ListStage;
}) {
  const { currentData, previousData, nextData } = data;

  console.log('currentData', currentData);
  console.log('previousData', previousData);
  console.log('nextData', nextData);
}
</script>
