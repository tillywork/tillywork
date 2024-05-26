<script setup lang="ts">
import {
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
  type Row,
  type Table,
} from '@tanstack/vue-table';
import {
  ListGroupOptions,
  type ListGroup,
  type ListStage,
} from '../../lists/types';
import { useCardsService } from '@/composables/services/useCardsService';
import type { TableSortOption } from './types';
import { useDialog } from '@/composables/useDialog';
import type { ProjectUser } from '@/components/common/projects/types';
import { DIALOGS } from '@/components/common/dialogs/types';
import type { Card } from '../../cards/types';

const emit = defineEmits(['load', 'toggle:group']);
const slots = defineSlots();
const props = defineProps<{
  listGroup: Row<ListGroup>;
  sortBy: TableSortOption[];
  listStages: ListStage[];
  projectUsers: ProjectUser[];
  table: Table<ListGroup>;
}>();
const rowHovered = defineModel('row:hovered');
const isGroupCardsLoading = defineModel<boolean>('loading');

const dialog = useDialog();
const cardsService = useCardsService();

const groupCopy = ref(props.listGroup);
const sortBy = computed(() => props.sortBy);
const tableSortState = computed(() =>
  sortBy.value.map((sortOption) => {
    return { id: sortOption.key, desc: sortOption.order === 'desc' };
  })
);
const columns = computed(
  () => props.table._getColumnDefs() as ColumnDef<Card, unknown>[]
);

const groupHeight = computed(() => (cards.value.length ?? 0) * 33 + 33);
const maxHeight = computed(() =>
  props.listGroup.original.name === 'Tasks' ? 'calc(100vh - 230px)' : 350
);

const cards = ref<Card[]>(props.listGroup.original.cards?.cards ?? []);
const total = ref(props.listGroup.original.cards?.total ?? 0);

const { fetchNextPage, isFetching, hasNextPage, refetch, data } =
  cardsService.useGetGroupCardsInfinite({
    listId: groupCopy.value.original.listId,
    groupId: groupCopy.value.original.id,
    filters: groupCopy.value.original.filter,
    initialCards: groupCopy.value.original.cards,
    sortBy,
  });

const groupTable = useVueTable({
  get data() {
    return cards.value;
  },
  columns: columns.value,
  getCoreRowModel: getCoreRowModel(),
  getRowId: (row) => `${row.id}`,
  manualPagination: true,
  manualGrouping: true,
  manualSorting: true,
  columnResizeMode: 'onChange',
  initialState: {
    sorting: tableSortState.value,
  },
});

async function handleGroupCardsLoad({
  done,
}: {
  done: (status?: any) => void;
}) {
  if (!isFetching.value) {
    fetchNextPage();

    if (hasNextPage.value) {
      done('ok');
    } else {
      done('empty');
    }
  }
}

function toggleGroupExpansion(listGroup: Row<ListGroup>) {
  emit('toggle:group', listGroup);
}

function openCreateCardDialog(listGroup: ListGroup) {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_CARD,
    data: {
      listId: listGroup.listId,
      listStage: getCurrentStage(listGroup),
      users: getCurrentAssignee(listGroup),
    },
  });
}

function handleHoverChange(row: Row<Card>, isHovering: boolean) {
  if (isHovering) {
    rowHovered.value = row;
  } else {
    rowHovered.value = undefined;
  }
}

function getCurrentStage(group: ListGroup) {
  let stage: ListStage | undefined;

  if (group.type === ListGroupOptions.LIST_STAGE) {
    stage = props.listStages.find((stage) => {
      return stage.id == group.entityId;
    });
  }

  return stage ? { ...stage } : undefined;
}

function getCurrentAssignee(group: ListGroup) {
  let user: ProjectUser | undefined;

  if (group.type === ListGroupOptions.ASSIGNEES) {
    user = props.projectUsers.find((user: ProjectUser) => {
      return user.user.id == group.entityId;
    });
  }

  return user ? [{ ...user }] : undefined;
}

watch(data, (v) => {
  if (v) {
    cards.value = v?.pages.map((page) => page.cards).flat() ?? [];
    total.value = v?.pages[0].total ?? 0;
  }
});

watch(
  () => props.listGroup.original.cards,
  () => {
    refetch();
  }
);

watchEffect(() => {
  if (isFetching.value) {
    isGroupCardsLoading.value = true;
  } else {
    isGroupCardsLoading.value = false;
  }
});
</script>

<template>
  <v-banner
    sticky
    lines="one"
    :border="listGroup.getIsExpanded() ? 'b-thin' : 'none'"
    bg-color="accent"
    style="z-index: 10"
  >
    <v-btn
      variant="text"
      density="comfortable"
      size="small"
      :icon="
        listGroup.getIsExpanded() ? 'mdi-chevron-down' : 'mdi-chevron-right'
      "
      :color="listGroup.getIsExpanded() ? 'info' : 'default'"
      class="me-2"
      @click="toggleGroupExpansion(listGroup)"
    />
    <div>
      <template v-if="listGroup.original.type === ListGroupOptions.ASSIGNEES">
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
            {{ total }}
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
  <template v-if="listGroup.getIsExpanded()">
    <v-list
      class="pa-0 overflow-scroll"
      rounded="0"
      :height="groupHeight"
      :max-height="maxHeight"
      :nav="false"
    >
      <v-infinite-scroll
        :height="groupHeight"
        :max-height="maxHeight"
        @load="handleGroupCardsLoad"
      >
        <template #empty></template>
        <template #loading></template>
        <template
          v-for="row in groupTable.getCoreRowModel().rows"
          :key="row.id"
        >
          <v-list-item
            class="pa-0"
            rounded="0"
            height="33"
            :to="`/pm/card/${row.original.id}`"
          >
            <v-hover
              @update:modelValue="
                (modelValue) => handleHoverChange(row, modelValue)
              "
              #="{ isHovering: isRowHovering, props: rowProps }"
            >
              <v-card
                v-bind="rowProps"
                link
                height="33"
                class="table-row d-flex align-center text-body-2"
                rounded="0"
              >
                <v-card
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :width="cell.column.getSize()"
                  class="table-cell d-flex align-center fill-height"
                  rounded="0"
                  color="transparent"
                  link
                >
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
              </v-card>
            </v-hover>
          </v-list-item>
        </template>
      </v-infinite-scroll>
    </v-list>
  </template>
</template>
