<script setup lang="ts">
import { ref } from 'vue';
import {
  DEFAULT_LIST_GROUP_BY_OPTIONS,
  ListGroupOptions,
} from '../lists/types';
import type { ListGroupOption } from './types';
import { computed } from 'vue';

const groupBy = defineModel<ListGroupOptions>();
const groupByOptions = ref(DEFAULT_LIST_GROUP_BY_OPTIONS);
const selectedOption = computed(() =>
  groupByOptions.value.find((option) => option.value === groupBy.value)
);
const isGroupByFilled = computed(() => groupBy.value && groupBy.value !== ListGroupOptions.ALL)

function handleGroupBySelection(option: ListGroupOption) {
  groupBy.value = option.value;
}

function isOptionSelected(option: ListGroupOption) {
  return option.value === groupBy.value;
}

function clearGroupBy() {
  groupBy.value = ListGroupOptions.ALL;
}
</script>

<template>
  <v-menu offset="5">
    <template #activator="{ props }">
      <v-chip
        v-bind="props"
        link
        rounded="xl"
        density="comfortable"
        :variant="isGroupByFilled ? 'tonal' : 'outlined'"
        color="primary"
      >
        <v-icon icon="mdi-layers-triple-outline" size="14" start />
        <span class="text-caption user-select-none">
          Group<template v-if="isGroupByFilled"
            >: {{ selectedOption?.label }}</template
          >
        </span>
        <template #append v-if="isGroupByFilled">
          <v-btn
            class="ms-1 me-n2"
            icon="mdi-close"
            size="x-small"
            variant="text"
            density="comfortable"
            @click="clearGroupBy"
            @click.stop
            color="primary"
            rounded="circle"
          />
        </template>
      </v-chip>
    </template>
    <v-card color="surface">
      <v-list nav density="compact" :lines="false">
        <template v-for="option in groupByOptions" :key="option.value">
          <v-list-item
            @click="handleGroupBySelection(option)"
            slim
            :active="isOptionSelected(option)"
          >
            <template #prepend>
              <v-icon
                :color="isOptionSelected(option) ? 'primary' : 'grey'"
                size="18"
                >{{ option.icon ?? 'mdi-circle-slice-8' }}</v-icon
              >
            </template>
            <v-list-item-title
              class="user-select-none"
              :class="isOptionSelected(option) ? 'font-weight-bold' : ''"
            >
              {{ option.label }}
            </v-list-item-title>
            <template #append>
              <v-icon
                icon="mdi-check"
                size="12"
                v-if="isOptionSelected(option)"
              />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
