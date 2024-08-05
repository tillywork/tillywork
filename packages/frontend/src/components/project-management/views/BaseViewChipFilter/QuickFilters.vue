<script setup lang="ts">
import type { User } from '@/components/common/users/types';
import type { ListStage } from '../../lists/types';
import { FieldTypes, type Field, type FieldItem } from '../../fields/types';
import type {
  FieldFilter,
  FilterGroup,
  FilterOperator,
} from '../../filters/types';
import {
  type QuickFilter,
  type QuickFilterGroup,
  quickFilterGroupsCustomFields,
  quickFilterItemsDate,
} from './quickFilter';
import { filterUtils } from '@/utils/filter';
import objectUtils from '@/utils/object';

const quickFilters = defineModel<FilterGroup>({
  required: true,
  default: {
    or: [],
  },
});

const props = defineProps<{
  listStages: ListStage[];
  users: User[];
  listFields: Field[];
}>();

const activeFilters = ref<Record<string, FieldFilter[]>>({});

const quickFilterOptions = computed<QuickFilter>(() => {
  const stageGroup: QuickFilterGroup = {
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
  };

  const dueDateGroup: QuickFilterGroup = {
    name: 'Due Date',
    field: 'card.data.due_at',
    icon: 'mdi-calendar-range',
    options: quickFilterItemsDate,
  };

  const assigneeGroup: QuickFilterGroup = {
    name: 'Assignee',
    field: 'users.id',
    icon: 'mdi-account',
    options: [
      {
        field: 'users.id',
        operator: 'isNull',
        value: [],
        title: 'No Assignee',
        type: FieldTypes.USER,
      },
      ...props.users.map((assignee) => {
        return {
          field: 'users.id',
          operator: 'in' as FilterOperator,
          value: [assignee.id],
          title: `${assignee.firstName} ${assignee.lastName}`,
          type: FieldTypes.USER,
        };
      }),
    ],
  };

  const customFieldGroups: QuickFilter = [];

  props.listFields
    ?.map((x) => x)
    .sort((a, b) => a.type.localeCompare(b.type))
    .forEach((field) => {
      const { type, name, items, icon, slug } = field;
      if (quickFilterGroupsCustomFields.includes(type)) {
        customFieldGroups.push({
          name,
          field: `card.data.${slug}`,
          icon,
          options:
            items?.map((item: FieldItem) => {
              return {
                field: `card.data.${slug}`,
                operator: filterUtils.getOperatorFromFieldType(field),
                value: [item.item],
                title: item.item,
                type: field.type,
              };
            }) ?? [],
        });
      }
    });

  return [dueDateGroup, stageGroup, assigneeGroup, ...customFieldGroups];
});

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
