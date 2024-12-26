<script setup lang="ts">
import type { User } from '@/components/common/users/types';
import type { ListStage } from '../../lists/types';
import {
  type QuickFilter,
  type QuickFilterGroup,
  quickFilterGroupsCustomFields,
  quickFilterDateOptions,
} from './quickFilter';
import { filterUtils } from '@/utils/filter';
import objectUtils from '@/utils/object';
import {
  type FilterGroup,
  type Field,
  type FieldFilter,
  type FilterOperator,
  FieldTypes,
  type FieldFilterOption,
} from '@tillywork/shared';

const quickFilters = defineModel<FilterGroup>({
  required: true,
  default: {
    or: [],
  },
});

const props = defineProps<{
  listStages: ListStage[];
  users: User[];
  fields: Field[];
}>();

const activeFilters = ref<Record<string, FieldFilter[]>>({});

const quickFilterOptions = computed<QuickFilter>(() => {
  const fieldGroups: QuickFilter = [];

  if (props.listStages.length) {
    fieldGroups.push({
      name: 'Stage',
      field: 'listStage.id',
      icon: 'mdi-circle-slice-8',
      options: props.listStages.map((stage) => {
        return {
          field: 'listStage.id',
          operator: 'in' as FilterOperator,
          value: [stage.id],
          title: stage.name,
          type: FieldTypes.DROPDOWN,
        };
      }),
    });
  }

  props.fields
    ?.map((x) => x)
    .sort((a, b) => a.type.localeCompare(b.type))
    .forEach((field) => {
      if (quickFilterGroupsCustomFields.includes(field.type)) {
        fieldGroups.push(buildFieldQuickFilterGroup(field));
      }
    });

  return fieldGroups;
});

function buildFieldQuickFilterGroup(field: Field): QuickFilterGroup {
  const options = buildFieldQuickFilterOptions(field);

  return {
    name: field.name,
    field: `card.data.${field.slug}`,
    icon: field.icon,
    options,
  };
}

function buildFieldQuickFilterOptions(field: Field) {
  let options: FieldFilterOption[] = [];

  switch (field.type) {
    case FieldTypes.LABEL:
    case FieldTypes.DROPDOWN:
      options =
        field.items?.map((item) => {
          return {
            field: `card.data.${field.slug}`,
            operator: filterUtils.getOperatorFromFieldType(field),
            value: [item.item],
            title: item.item,
            type: field.type,
          };
        }) ?? [];
      break;

    case FieldTypes.DATETIME:
    case FieldTypes.DATE:
      options = quickFilterDateOptions.map((option) => {
        return {
          ...option,
          field: `card.data.${field.slug}`,
        };
      });
      break;

    case FieldTypes.USER:
      options = props.users.map((user) => {
        return {
          field: `card.data.${field.slug}`,
          operator: filterUtils.getOperatorFromFieldType(field),
          title: `${user.firstName} ${user.lastName}`,
          type: FieldTypes.USER,
          value: [user.id],
        };
      });
      break;
  }

  options.push({
    field: `card.data.${field.slug}`,
    operator: 'isNull',
    value: [],
    title: `No ${field.name}`,
    type: field.type,
  });

  return options;
}

function handleQuickFilterOptionClicked() {
  quickFilters.value = mapActiveQuickFiltersToUsableFormat();
}

/**
 * Maps selected quick filters to a FilterGroup. We use OR between filters on the same field, and AND between different fields.
 */
function mapActiveQuickFiltersToUsableFormat(): FilterGroup {
  const activeFilterFields = Object.keys(activeFilters.value);
  const activeFilterFieldGroups = {
    and: activeFilterFields
      .map((key) => {
        const values = Object.values(activeFilters.value[key]);
        if (values.length === 0) {
          return null; // Skip fields with no active filters
        }
        return {
          or: values,
        };
      })
      .filter((group) => group !== null), // Filter out null entries
  };

  return activeFilterFieldGroups;
}

/** Responsible for filling the activeFilters ref from filters saved in the view */
watch(
  quickFilters,
  (v) => {
    const compareAgainst = mapActiveQuickFiltersToUsableFormat();
    const areTheyNotEqual = !objectUtils.isEqual(v, compareAgainst);

    if (areTheyNotEqual) {
      if (v.and) {
        const activeFiltersMapping: Record<string, FieldFilter[]> = {};
        v.and.forEach((filter) => {
          const filterGroup = filter as FilterGroup;
          filterGroup.or?.forEach((filter) => {
            const fieldFilter = filter as FieldFilter;
            const quickFilterGroup = quickFilterOptions.value.find(
              (option) => option.field === fieldFilter.field
            );
            const quickFilterOption = quickFilterGroup?.options.find((option) =>
              filterUtils.areFilterOptionsEqual(option, fieldFilter)
            );

            if (quickFilterOption) {
              if (!activeFiltersMapping[fieldFilter.field]) {
                activeFiltersMapping[fieldFilter.field] = [quickFilterOption];
              } else {
                activeFiltersMapping[fieldFilter.field] = [
                  ...activeFiltersMapping[fieldFilter.field],
                  quickFilterOption,
                ];
              }
            }
          });
        });

        activeFilters.value = activeFiltersMapping;
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <v-card border="none">
    <template v-for="group in quickFilterOptions" :key="group.name">
      <div class="d-flex flex-column flex-wrap mt-2">
        <v-card-title
          class="text-capitalize text-body-3 d-flex align-center ga-2"
        >
          <v-icon :icon="group.icon" size="x-small" />
          {{ group.name }}
        </v-card-title>
        <v-chip-group
          v-model="activeFilters[group.field]"
          multiple
          column
          selected-class="text-primary"
          @click="handleQuickFilterOptionClicked"
        >
          <template v-for="item in group.options" :key="item.title">
            <v-chip :text="item.title" :value="item" size="small" />
          </template>
        </v-chip-group>
      </div>
    </template>
  </v-card>
</template>
