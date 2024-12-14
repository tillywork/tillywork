<script setup lang="ts">
import {
  TASK_STATUS_OPTIONS,
  type TaskActivityStatus,
} from '@tillywork/shared';

const model = defineModel<TaskActivityStatus>();

const selectedStatus = computed(() =>
  TASK_STATUS_OPTIONS.find((option) => option.value === model.value)
);

function handleSelectStatus(status: TaskActivityStatus) {
  model.value = status;
}
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-chip
        v-bind="props"
        :color="selectedStatus?.color"
        density="comfortable"
        class="text-caption"
        rounded="pill"
        variant="tonal"
      >
        <template #prepend>
          <v-icon icon="mdi-circle-slice-8" class="me-2" />
        </template>
        {{ selectedStatus?.title ?? 'Task Status' }}
      </v-chip>
    </template>
    <v-card>
      <v-list>
        <template v-for="option in TASK_STATUS_OPTIONS" :key="option.value">
          <v-list-item
            @click="handleSelectStatus(option.value as TaskActivityStatus)"
            :active="selectedStatus?.value === option.value"
          >
            <template #prepend>
              <v-icon icon="mdi-circle-slice-8" :color="option.color" />
            </template>
            <v-list-item-title>
              {{ option.title }}
            </v-list-item-title>
            <template #append>
              <v-icon
                v-if="selectedStatus?.value === option.value"
                icon="mdi-check"
                size="12"
              />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
