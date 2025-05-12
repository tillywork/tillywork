<script setup lang="ts">
import { useCardActivitiesService } from '@/services/useCardActivitiesService';

import { useAuthStore } from '@/stores/auth';
import { useQueryStore } from '@/stores/query';
import { useSnackbarStore } from '@/stores/snackbar';

import {
  type SortOption,
  type CardActivity,
  type Card,
} from '@tillywork/shared';
import type { ColumnDef } from '@tanstack/vue-table';

import BaseTable from '../../common/tables/BaseTable/BaseTable.vue';
import BaseDatePicker from '../../common/inputs/BaseDatePicker.vue';
import BaseUserSelector from '@/components/common/inputs/BaseUserSelector/BaseUserSelector.vue';
import TaskFilters from './TaskFilters.vue';

const {
  useFindAllTasksQuery,
  useSetTaskAsCompleted,
  useSetTaskAsNotCompleted,
} = useCardActivitiesService();

const { showSnackbar } = useSnackbarStore();
const { users } = storeToRefs(useQueryStore());
const { workspace, user } = storeToRefs(useAuthStore());

const sortBy = ref<SortOption>({
  key: 'createdAt',
  order: 'DESC',
});

const taskFilters = ref({
  assignee: [Number(user.value?.id)],
  dueDate: [],
  isCompleted: false,
});

const { mutateAsync: setTaskAsCompleted } = useSetTaskAsCompleted();
const { mutateAsync: setTaskAsNotCompleted } = useSetTaskAsNotCompleted();

const { data: tasks } = useFindAllTasksQuery({
  workspaceId: workspace.value!.id,
  assignee: computed(() => taskFilters.value.assignee),
  dueDate: computed(() => taskFilters.value.dueDate ?? []),
  isCompleted: computed(() => taskFilters.value.isCompleted),
  sortBy,
});

const columns: ColumnDef<CardActivity, any>[] = [
  {
    id: 'title',
    header: 'Title',
    accessorFn: (row) => row.content.title,
    minSize: 350,
  },
  {
    id: 'card',
    header: 'Associated Card',
  },
  {
    id: 'dueAt',
    header: 'Due Date',
    accessorFn: (row) => row.content.dueAt,
    minSize: 180,
  },
  {
    id: 'assignee',
    header: 'Assigned To',
    accessorFn: (row) => row.content.assignee,
    minSize: 100,
  },
];

function getPersonName(card: Card): string {
  let name = '';

  if (card.data.first_name) {
    name = card.data.first_name;

    if (card.data.last_name) name += ` ${card.data.last_name}`;
  } else if (card.data.last_name) {
    name = card.data.last_name;
  }

  return name;
}

function getTaskAssociatedCard(task: CardActivity) {
  const card = task.card;

  if (card.data.title) {
    return card.data.title;
  } else if (card.data.name) {
    return card.data.name;
  } else if (card.data.first_name || card.data.last_name || card.data.email) {
    return getPersonName(card);
  }
}

function handleIsCompletedToggle({
  task,
  isCompleted,
}: {
  task: CardActivity;
  isCompleted: boolean;
}) {
  if (isCompleted) {
    handleSetTaskAsCompleted(task);
  } else {
    handleSetTaskAsNotCompleted(task);
  }
}

function handleSetTaskAsCompleted(task: CardActivity) {
  try {
    setTaskAsCompleted(task);
  } catch {
    showSnackbar({
      message: 'Something went wrong, please try again',
      color: 'error',
    });
  }
}

function handleSetTaskAsNotCompleted(task: CardActivity) {
  try {
    setTaskAsNotCompleted(task);
  } catch {
    showSnackbar({
      message: 'Something went wrong, please try again',
      color: 'error',
    });
  }
}
</script>

<template>
  <div class="position-relative">
    <div class="px-6 pt-2 pb-0">
      <div class="d-flex align-center mb-2 px-2 pt-1">
        <v-icon icon="mdi-clipboard-list" size="small" start />
        <span class="text-h6 font-weight-regular">Tasks</span>
      </div>
    </div>
    <v-divider />
    <v-card class="px-6 py-4" color="transparent">
      <task-filters v-model="taskFilters" />

      <template v-if="tasks">
        <base-table :data="tasks" :columns enable-column-resizing>
          <template #title="{ row }">
            <v-card class="d-flex align-center ga-2">
              <v-checkbox
                :model-value="row.original.content.isCompleted"
                v-tooltip="'Set as completed'"
                @update:model-value="
                  (v) =>
                    handleIsCompletedToggle({
                      task: row.original,
                      isCompleted: v,
                    })
                "
              />
              {{ row.original.content.title }}
            </v-card>
          </template>
          <template #dueAt="{ row }">
            <v-card class="py-2">
              <base-date-picker
                :model-value="row.original.content.dueAt"
                include-time
              />
            </v-card>
          </template>
          <template #card="{ row }">
            <router-link
              :to="`/card/${row.original.card.id}`"
              class="text-primary"
            >
              {{ getTaskAssociatedCard(row.original) }}
            </router-link>
          </template>
          <template #assignee="{ row }">
            <base-user-selector
              v-if="users"
              :model-value="row.original.content.assignee"
              :users
              label="Assignee"
              return-id
            />
          </template>
        </base-table>
      </template>
    </v-card>
  </div>
</template>
