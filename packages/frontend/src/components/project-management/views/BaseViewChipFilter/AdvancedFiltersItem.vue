<script setup lang="ts">
import validationUtils from '@/utils/validation';
import { FieldTypes } from '../../../common/fields/types';
import type { FieldFilterOption } from './types';
import type { User } from '@/components/common/users/types';
import type { FieldFilter, FilterOperator } from '../../filters/types';
import { useStateStore } from '@/stores/state';
import BaseRelationInput from '@/components/common/inputs/BaseRelationInput.vue';

const filter = defineModel<FieldFilter>({
  required: true,
});
const props = defineProps<{
  index: number;
  fields: FieldFilterOption[];
  users: User[];
}>();
const emit = defineEmits(['delete']);

const { currentList } = storeToRefs(useStateStore());
const { rules } = validationUtils;
const filterOption = ref<string>();

const selectedFilter = computed(() =>
  props.fields.find((f) => f.field === filter.value.field)
);

const dropdownOptions = computed(() => {
  // Add specific field options here
  switch (filter.value.field) {
    case 'listStage.id':
      return (
        currentList.value?.listStages.map((listStage) => {
          return {
            title: listStage.name,
            value: listStage.id,
          };
        }) ?? []
      );

    default:
      return selectedFilter.value?.options?.map((option) => {
        return {
          title: option.item,
          value: option.item,
        };
      });
  }
});

const hideFilterValue = computed(() => {
  return ['isNull', 'isNotNull'].includes(filterOption.value ?? '');
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

const filteringOptions = [
  {
    title: 'Is',
    value: 'between',
  },
  {
    title: 'Is not',
    value: 'nbetween',
  },
  {
    title: 'Is empty',
    value: 'isNull',
  },
  {
    title: 'Is not empty',
    value: 'isNotNull',
  },
];

function removeFilter() {
  emit('delete', props.index);
}

/**
 * Triggered when filteringOptions are selected
 * @param value Value of the option selected
 */
function handleFilteringOptionChange(value: string) {
  filter.value.operator = mapFilterOptionValueToOperator(value);
}

/**
 * Returns the correct operator
 * depending on filter type
 * based on the incoming fitler option
 * value.
 * @param value Value of the option to map
 */
function mapFilterOptionValueToOperator(value: string): FilterOperator {
  switch (selectedFilter.value?.type) {
    case FieldTypes.USER:
    case FieldTypes.DROPDOWN:
    case FieldTypes.LABEL:
    case FieldTypes.CARD:
      if (value === 'between') {
        return 'in';
      } else if (value === 'nbetween') {
        return 'nin';
      } else {
        return value as FilterOperator;
      }
    case FieldTypes.DATE:
    default:
      return value as FilterOperator;
  }
}

/**
 * Returns the correct filter option
 * depending on filter type
 * based on the filter operator
 * value.
 * @param value Value of the operator to map
 */
function mapFilterOperatorToFileringOption(
  value: FilterOperator
): FilterOperator {
  switch (selectedFilter.value?.type) {
    case FieldTypes.USER:
    case FieldTypes.DROPDOWN:
    case FieldTypes.LABEL:
    case FieldTypes.CARD:
      if (value === 'in') {
        return 'between';
      } else if (value === 'nin') {
        return 'nbetween';
      } else {
        return value as FilterOperator;
      }
    case FieldTypes.DATE:
    default:
      return value as FilterOperator;
  }
}

function resetFilter(selectedFilter: FieldFilter) {
  const { value, operator } = selectedFilter;
  filter.value = {
    ...filter.value,
    value,
    operator,
  };
}

function handleFieldChanged() {
  if (selectedFilter.value) {
    resetFilter(selectedFilter.value);
  }
}

// Set selected filter option when filter is initialized
watch(
  filter,
  (v) => {
    if (v) {
      filterOption.value = mapFilterOperatorToFileringOption(v.operator);
    }
  },
  { immediate: true }
);
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
      max-width="33%"
      auto-select-first
      @update:modelValue="handleFieldChanged"
      :rules="[rules.required]"
    >
      <template #item="{ item, props }">
        <v-list-item class="text-body-3" v-bind="props" slim>
          <template #prepend>
            <v-icon :icon="item.raw.icon" />
          </template>
        </v-list-item>
      </template>
    </v-autocomplete>
    <template v-if="selectedFilter?.type === FieldTypes.TEXT">
      <v-autocomplete
        :items="textOperators"
        v-model="filter.operator"
        label="Operator"
        single-line
        hide-details
        max-width="160"
        auto-select-first
        :rules="[rules.required]"
        class="me-2"
      />
      <v-text-field
        v-model="filter.value"
        label="Value"
        hide-details
        single-line
        clearable
        :rules="[rules.required]"
      />
    </template>
    <template
      v-else-if="[FieldTypes.DROPDOWN, FieldTypes.LABEL].includes(selectedFilter!.type)"
    >
      <v-autocomplete
        :items="filteringOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Operator"
        single-line
        hide-details
        max-width="160"
        auto-select-first
        :rules="[rules.required]"
        class="me-2"
      />
      <v-autocomplete
        v-if="!hideFilterValue"
        v-model="filter.value"
        single-line
        hide-details
        :items="dropdownOptions"
        auto-select-first
        :rules="[rules.array.required]"
        multiple
        width="160"
        autocomplete="off"
        chips
        closable-chips
      />
    </template>
    <template v-else-if="selectedFilter?.type === FieldTypes.DATE">
      <v-autocomplete
        :items="filteringOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Operator"
        single-line
        hide-details
        max-width="160"
        auto-select-first
        :rules="[rules.required]"
        class="me-2"
      />
      <base-date-picker
        v-if="!hideFilterValue"
        v-model="filter.value"
        text-field
        range
      />
    </template>
    <template v-else-if="selectedFilter?.type === FieldTypes.USER">
      <v-autocomplete
        :items="filteringOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Operator"
        single-line
        hide-details
        max-width="160"
        auto-select-first
        :rules="[rules.required]"
        class="me-2"
      />
      <base-user-selector
        v-if="!hideFilterValue"
        v-model="filter.value"
        :users
        text-field
        return-id
      />
    </template>
    <template v-else-if="selectedFilter?.type === FieldTypes.CARD">
      <v-autocomplete
        :items="filteringOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Operator"
        single-line
        hide-details
        max-width="160"
        auto-select-first
        :rules="[rules.required]"
        class="me-2"
      />
      <base-relation-input
        v-if="!hideFilterValue && selectedFilter.original"
        v-model="filter.value"
        :field="selectedFilter.original"
        :key="selectedFilter.field"
        multiple
      />
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
