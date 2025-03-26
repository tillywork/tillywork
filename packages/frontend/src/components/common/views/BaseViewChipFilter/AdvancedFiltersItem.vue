<script setup lang="ts">
import validationUtils from '@/utils/validation';

import BaseRelationInput from '@/components/common/inputs/BaseRelationInput.vue';
import BaseDatePicker from '../../inputs/BaseDatePicker.vue';

import {
  type FieldFilter,
  type FieldFilterOption,
  type FilterOperator,
  FieldTypes,
} from '@tillywork/shared';

import { useQueryStore } from '@/stores/query';

const filter = defineModel<FieldFilter>({
  required: true,
});
const {
  index,
  fields,
  hideDelete = false,
} = defineProps<{
  index: number;
  fields: FieldFilterOption[];
  hideDelete?: boolean;
}>();
const emit = defineEmits(['delete']);

const { users, listStages } = storeToRefs(useQueryStore());

const { rules } = validationUtils;
const filterOption = ref<string>();

const selectedFilter = computed(
  () => fields.find((f) => f.field === filter.value.field) ?? fields[0]
);

const dropdownOptions = computed(() => {
  switch (filter.value.field) {
    case 'listStage.id':
      return (
        listStages.value.map((listStage) => {
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

const fieldStylingProps = computed(() => {
  const props: Record<string, any> = {
    class: ['me-2'],
  };

  if (!hideFilterValue.value) {
    props.class.push('flex-equal');
  } else {
    props.maxWidth = 224;
  }

  return props;
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

const checkboxOptions = [
  {
    title: 'Is true',
    value: 'isTrue',
  },
  {
    title: 'Is false',
    value: 'isFalse',
  },
];

const numberOperators = [
  {
    title: 'Equals',
    value: 'eq',
  },
  {
    title: 'Less Than',
    value: 'lt',
  },
  {
    title: 'Greater Than',
    value: 'gt',
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
  emit('delete', index);
}

/**
 * Triggered when filteringOptions are selected
 * @param value Value of the option selected
 */
function handleFilteringOptionChange(filterOption: string) {
  if (selectedFilter.value?.type === FieldTypes.CHECKBOX) {
    if (filterOption === 'isTrue') {
      filter.value.operator = 'eq';
      filter.value.value = true;
    } else if (filterOption === 'isFalse') {
      filter.value.operator = 'neOrNull';
      filter.value.value = true;
    }
  } else {
    filter.value.operator = mapFilterOptionValueToOperator(filterOption);
  }
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
    case FieldTypes.DATETIME:
    case FieldTypes.DATE:
    case FieldTypes.NUMBER:
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
    case FieldTypes.CHECKBOX:
      if (value === 'eq') {
        return 'isTrue' as FilterOperator;
      } else if (value === 'neOrNull') {
        return 'isFalse' as FilterOperator;
      }
      return 'isTrue' as FilterOperator;
    case FieldTypes.DATETIME:
    case FieldTypes.DATE:
    case FieldTypes.NUMBER:
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
      if (selectedFilter.value?.type === FieldTypes.CHECKBOX) {
        handleFilteringOptionChange(filterOption.value);
      }
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
      v-bind="fieldStylingProps"
      :items="fields"
      item-value="field"
      :prepend-inner-icon="selectedFilter?.icon"
      v-model="filter.field"
      label="Field"
      single-line
      hide-details
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
    <template
      v-if="[FieldTypes.TEXT, FieldTypes.RICH].includes(selectedFilter!.type)"
    >
      <v-autocomplete
        v-bind="fieldStylingProps"
        :items="textOperators"
        v-model="filter.operator"
        label="Operator"
        single-line
        hide-details
        auto-select-first
        :rules="[rules.required]"
      />
      <v-text-field
        v-if="!hideFilterValue"
        v-bind="fieldStylingProps"
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
        v-bind="fieldStylingProps"
        :items="filteringOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Operator"
        single-line
        hide-details
        auto-select-first
        :rules="[rules.required]"
      />
      <v-autocomplete
        v-if="!hideFilterValue"
        v-bind="fieldStylingProps"
        v-model="filter.value"
        single-line
        hide-details
        :items="dropdownOptions"
        auto-select-first
        :rules="[rules.array.required]"
        multiple
        autocomplete="off"
        chips
        closable-chips
      />
    </template>
    <template
      v-else-if="
        selectedFilter &&
        [FieldTypes.DATE, FieldTypes.DATETIME].includes(selectedFilter.type)
      "
    >
      <v-autocomplete
        v-bind="fieldStylingProps"
        :items="filteringOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Operator"
        single-line
        hide-details
        auto-select-first
        :rules="[rules.required]"
      />
      <base-date-picker
        v-if="!hideFilterValue"
        v-bind="fieldStylingProps"
        v-model="filter.value"
        text-field
        range
      />
    </template>
    <template v-else-if="selectedFilter?.type === FieldTypes.USER">
      <v-autocomplete
        v-bind="fieldStylingProps"
        :items="filteringOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Operator"
        single-line
        hide-details
        auto-select-first
        :rules="[rules.required]"
      />
      <base-user-selector
        v-if="!hideFilterValue"
        v-bind="fieldStylingProps"
        v-model="filter.value"
        :users
        text-field
        return-id
      />
    </template>
    <template v-else-if="selectedFilter?.type === FieldTypes.CARD">
      <v-autocomplete
        v-bind="fieldStylingProps"
        :items="filteringOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Operator"
        single-line
        hide-details
        auto-select-first
        :rules="[rules.required]"
      />
      <base-relation-input
        v-if="!hideFilterValue && selectedFilter.original"
        v-bind="fieldStylingProps"
        v-model="filter.value"
        :field="selectedFilter.original"
        :key="selectedFilter.field"
        multiple
      />
    </template>
    <template v-if="selectedFilter?.type === FieldTypes.CHECKBOX">
      <v-autocomplete
        v-bind="fieldStylingProps"
        :items="checkboxOptions"
        v-model="filterOption"
        @update:model-value="handleFilteringOptionChange"
        label="Value"
        single-line
        hide-details
        auto-select-first
        :rules="[rules.required]"
      />
    </template>
    <template v-if="selectedFilter?.type === FieldTypes.NUMBER">
      <v-autocomplete
        v-bind="fieldStylingProps"
        :items="numberOperators"
        v-model="filter.operator"
        label="Operator"
        single-line
        hide-details
        auto-select-first
        :rules="[rules.required]"
      />
      <v-number-input
        v-if="!hideFilterValue"
        v-bind="fieldStylingProps"
        v-model="filter.value"
        label="Value"
        hide-details
        single-line
        clearable
        :rules="[rules.required]"
      />
    </template>
    <base-icon-btn
      v-if="!hideDelete"
      icon="mdi-close"
      color="error"
      size="x-small"
      variant="tonal"
      @click="removeFilter"
    />
  </v-card>
</template>
