<script setup lang="ts">
import BaseViewChip from './BaseViewChip.vue';
import { DEFAULT_SORT_OPTIONS } from './types';
import posthog from 'posthog-js';
import type { List, SortOption, ViewSortOption } from '@tillywork/shared';
import { useFieldQueryStore } from '@/stores/field.query';

const sortBy = defineModel<SortOption>();

const { list } = defineProps<{
  list: List;
}>();

const { groupableFields } = storeToRefs(useFieldQueryStore());

const sortByOptions = computed(() => {
  const arr = [...DEFAULT_SORT_OPTIONS];

  if (list.listStages?.length) {
    arr.push({
      label: 'Completed',
      icon: 'mdi-list-status',
      value: {
        key: 'listStage.isCompleted',
        order: 'ASC',
      },
    });
  }

  if (groupableFields) {
    groupableFields.value?.forEach((field) => {
      arr.push({
        label: field.name,
        icon: field.icon,
        value: {
          key: `card.data->>'${field.slug}'`,
          order: 'ASC',
        },
      });
    });
  }

  return arr;
});

const selectedOption = computed(() =>
  sortByOptions.value.find((option) => isOptionSelected(option))
);
const isSortByFilled = computed(() => !!sortBy.value);
const sortDirectionIcon = computed(() => {
  if (!selectedOption.value) return 'mdi-swap-vertical';

  if (sortBy.value?.order === 'ASC') return 'mdi-arrow-up';
  if (sortBy.value?.order === 'DESC') return 'mdi-arrow-down';

  return 'mdi-swap-vertical';
});

function handleSortBySelection(option: ViewSortOption) {
  posthog.capture('Updated Sort By', {
    option: option.value,
  });

  if (isOptionSelected(option)) {
    toggleSortDirection();
  } else {
    sortBy.value = { ...option.value };
    if (sortBy.value) sortBy.value.order = 'ASC';
  }
}

function isOptionSelected(option: ViewSortOption) {
  return option.value.key === sortBy.value?.key;
}

function clearSortBy() {
  posthog.capture('Updated Sort By', {
    option: null,
  });

  sortBy.value = undefined;
}

function toggleSortDirection() {
  if (sortBy.value) {
    sortBy.value = {
      ...sortBy.value,
      order: sortBy.value?.order === 'ASC' ? 'DESC' : 'ASC',
    };
  }
}
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <base-view-chip
        v-bind="props"
        :icon="sortDirectionIcon"
        :label="
          'Sort' +
          (isSortByFilled && selectedOption ? ': ' + selectedOption.label : '')
        "
        :is-filled="isSortByFilled && !!selectedOption"
      >
        <template #append v-if="isSortByFilled && !!selectedOption">
          <v-btn
            class="ms-1 me-n2"
            icon="mdi-close"
            size="x-small"
            variant="text"
            density="comfortable"
            @click="clearSortBy"
            @click.stop
            color="primary"
            rounded="circle"
          />
        </template>
      </base-view-chip>
    </template>
    <v-card>
      <v-list>
        <template v-for="option in sortByOptions" :key="option.value">
          <v-list-item
            @click="handleSortBySelection(option)"
            :active="isOptionSelected(option)"
          >
            <template #prepend>
              <v-icon :color="isOptionSelected(option) ? 'primary' : 'grey'">{{
                option.icon ?? 'mdi-circle-slice-8'
              }}</v-icon>
            </template>
            <v-list-item-title
              class="user-select-none"
              :class="isOptionSelected(option) ? 'font-weight-bold' : ''"
            >
              {{ option.label }}
            </v-list-item-title>
            <template #append>
              <v-icon v-if="isOptionSelected(option)" size="x-small">
                {{ sortDirectionIcon }}
              </v-icon>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
