<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type Row,
  type Column,
} from '@tanstack/vue-table';
import { useListGroupsService } from '@/services/useListGroupsService';
import type { Card } from '../../cards/types';
import { type List, type ListGroup } from '../../lists/types';
import { useListStagesService } from '@/services/useListStagesService';
import { useProjectUsersService } from '@/services/useProjectUsersService';
import ListViewGroup from './ListViewGroup.vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAuthStore } from '@/stores/auth';
import type { View } from '@tillywork/shared';

const isLoading = defineModel<boolean>('loading');

const props = defineProps<{
  list: List;
  view: View;
  groups: ListGroup[];
}>();

const emit = defineEmits([
  'row:delete',
  'submit',
  'load',
  'row:update:stage',
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
      <v-card class="list-groups overflow-scroll">
        <template
          v-for="listGroup in table.getCoreRowModel().rows"
          :key="
            'list-group-' +
            listGroup.original.id +
            '-' +
            listGroup.subRows.length
          "
        >
          <list-view-group
            v-model:loading="isLoading"
            :list-group="listGroup"
            :list-stages="listStages ?? []"
            :list
            :view
            :project-users="projectUsers ?? []"
            :table
            @toggle:group="toggleGroupExpansion"
            @row:delete="handleDeleteCard"
            @row:update:stage="handleUpdateCardStage"
            @row:update:order="handleUpdateCardOrder"
          />
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
