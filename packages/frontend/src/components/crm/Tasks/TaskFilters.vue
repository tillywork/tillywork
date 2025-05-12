<script setup lang="ts">
import AssigneeFilterChip from './AssigneeFilterChip.vue';
import DueDateFilterChip from './DueDateFilterChip.vue';
import StatusFilterChip from './StatusFilterChip.vue';

type TaskFilters = {
  assignee?: number[];
  dueDate?: string[];
  isCompleted?: boolean;
};

const filters = defineModel<TaskFilters>({
  default: {},
});
</script>

<template>
  <div class="mb-4 d-flex ga-2">
    <assignee-filter-chip v-model="filters.assignee" />
    <due-date-filter-chip v-model="filters.dueDate" />
    <status-filter-chip v-model="filters.isCompleted" />
  </div>
</template>
