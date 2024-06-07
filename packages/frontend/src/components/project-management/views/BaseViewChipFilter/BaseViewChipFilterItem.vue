<script setup lang="ts">
import validationUtils from '@/utils/validation';
import { PropTypes } from '../../props/types';
import { type FieldFilter } from '../types';
import type { FieldFilterOption } from './types';

const filter = defineModel<FieldFilter>({
  required: true,
});
const selectedFilter = computed(() =>
  props.fields.find((f) => f.field === filter.value.field)
);
const props = defineProps<{
  index: number;
  fields: FieldFilterOption[];
}>();
const emit = defineEmits(['delete']);
const { rules } = validationUtils;

const dropdownOptions = computed(() => {
  switch (filter.value.field) {
    // Add specific field options here
    case 'status':
      return statusOptions;

    default:
      return [];
  }
});

const textOperators = [
  {
    title: 'Equals',
    value: 'eq',
  },
  {
    title: 'Includes',
    value: 'like',
  },
  {
    title: 'Starts With',
    value: 'like%',
  },
  {
    title: 'Ends With',
    value: '%like',
  },
];

const statusOptions = [
  {
    title: 'Open',
    value: 'open',
  },
  {
    title: 'Closed',
    value: 'closed',
  },
];

function removeFilter() {
  emit('delete', props.index);
}
</script>

<template>
  <v-card
    class="filter-group d-flex align-center flex-row mb-2 pt-2"
    border="none"
    rounded="0"
  >
    <v-autocomplete
      :items="fields"
      item-value="field"
      :prepend-inner-icon="selectedFilter?.icon"
      v-model="filter.field"
      label="Field"
      class="me-2"
      single-line
      hide-details
      max-width="40%"
      auto-select-first
      :rules="[rules.required]"
    >
      <template #item="{ item, props }">
        <v-list-item class="text-body-2" v-bind="props" slim>
          <template #prepend>
            <v-icon :icon="item.raw.icon" />
          </template>
        </v-list-item>
      </template>
    </v-autocomplete>
    <template v-if="selectedFilter?.type === PropTypes.TEXT">
      <v-autocomplete
        :items="textOperators"
        v-model="filter.operator"
        label="Operator"
        single-line
        hide-details
        max-width="120"
        auto-select-first
        :rules="[rules.required]"
      />
      <v-text-field
        v-model="filter.value"
        label="Value"
        hide-details
        single-line
        width="30%"
        :rules="[rules.required]"
      />
    </template>
    <template v-else-if="selectedFilter?.type === PropTypes.DROPDOWN">
      <v-autocomplete
        v-model="filter.value"
        single-line
        hide-details
        :items="dropdownOptions"
        auto-select-first
        :rules="[rules.array.required]"
      />
    </template>
    <template v-else-if="selectedFilter?.type === PropTypes.DATE">
      <base-date-picker v-model="filter.value" text-field range />
    </template>
    <template v-else-if="selectedFilter?.type === PropTypes.USER">
      <base-user-selector v-model="filter.value" :users="[]" />
    </template>
    <base-icon-btn
      icon="mdi-close"
      color="error"
      class="ms-2"
      size="x-small"
      variant="tonal"
      @click="removeFilter"
    />
  </v-card>
</template>
