<script setup lang="ts">
import { useFields } from '@/composables/useFields';
import { useStateStore } from '@/stores/state';
import BaseViewChip from './BaseViewChip.vue';
import {
  type TableSortOption,
  type ListSortOption,
  DEFAULT_SORT_OPTIONS,
} from './types';
import posthog from 'posthog-js';

const sortBy = defineModel<TableSortOption>();

const { currentList } = storeToRefs(useStateStore());
const cardTypeId = computed(() => currentList.value?.defaultCardType.id ?? 0);
const listId = computed(() => currentList.value?.id ?? 0);
const fieldsEnabled = computed(() => !!currentList.value);

const { groupableFields } = useFields({
  cardTypeId,
  listId,
  enabled: fieldsEnabled,
});

const sortByOptions = computed(() => {
  const arr = [...DEFAULT_SORT_OPTIONS];

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

function handleSortBySelection(option: ListSortOption) {
  posthog.capture('updated_sort_by', {
    option: option.value,
  });

  if (isOptionSelected(option)) {
    toggleSortDirection();
  } else {
    sortBy.value = { ...option.value };
    if (sortBy.value) sortBy.value.order = 'ASC';
  }
}

function isOptionSelected(option: ListSortOption) {
  return option.value.key === sortBy.value?.key;
}

function clearSortBy() {
  posthog.capture('updated_sort_by', {
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
