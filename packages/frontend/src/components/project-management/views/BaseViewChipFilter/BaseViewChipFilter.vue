<script setup lang="ts">
import BaseViewChip from '../BaseViewChip.vue';
import BaseViewChipFilterItem from './BaseViewChipFilterItem.vue';
import { FieldTypes, type Field } from '../../fields/types';
import type { VForm } from 'vuetify/components';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import type {
  FieldFilter,
  FilterGroup,
  FilterOperator,
  QueryFilter,
} from '../../filters/types';
import type { FieldFilterOption } from './types';
import { useFieldsService } from '@/composables/services/useFieldsService';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useAuthStore } from '@/stores/auth';
import { useStateStore } from '@/stores/state';

import {
  quickFilterGroups,
  defaultQuickFilterGroupedItems,
  type QuickFilterGroup,
} from './quickFilter';

const props = defineProps<{
  filters?: QueryFilter;
  viewId: number;
}>();
const emit = defineEmits(['save', 'update']);

const filtersForm = ref<VForm>();
const filtersMenu = ref(false);
const addFilterMenu = ref(false);
const filtersCopy = ref<QueryFilter>(
  props.filters ? cloneDeep({ ...props.filters }) : { where: { and: [] } }
);
const isSnackbarOpen = ref(false);
const snackbarId = ref<number>();

const { useFieldsQuery } = useFieldsService();
const { showSnackbar, closeSnackbar } = useSnackbarStore();
const { project } = storeToRefs(useAuthStore());
const { useProjectUsersQuery } = useProjectUsersService();

// TODO-Refactor: After MR 110 merged, should be handle on parent and pass with props or provide/inject
const { data: users } = useProjectUsersQuery({
  projectId: project.value!.id,
  select: (projectUsers) => projectUsers.map((pj) => pj.user),
});

const { currentList } = storeToRefs(useStateStore());
const listId = computed(() => currentList.value!.id);
const { data: listFields, refetch: refetchListFields } = useFieldsQuery({
  listId,
});
const listStagesService = useListStagesService();
const { data: listStages } = listStagesService.useGetListStagesQuery({
  listId,
});

watch(listStages, (stages) => {
  if (stages) {
    quickFilterGroupedItems.value.stage = stages.map((stage) => {
      return {
        field: 'listStage.id',
        operator: 'eq',
        value: stage.id,
        title: stage.name,
        type: FieldTypes.DROPDOWN,
      };
    });
  }
});

const defaultFields = ref<FieldFilterOption[]>([
  {
    title: 'Title',
    field: 'card.title',
    operator: 'eq',
    value: '',
    type: FieldTypes.TEXT,
    icon: 'mdi-format-title',
  },
  {
    title: 'Due Date',
    field: 'card.dueAt',
    operator: 'between',
    value: '',
    type: FieldTypes.DATE,
    icon: 'mdi-calendar-range',
  },
  {
    title: 'Assignee',
    field: 'users.id',
    operator: 'in',
    value: [],
    type: FieldTypes.USER,
    icon: 'mdi-account',
  },
  {
    title: 'Stage',
    field: 'listStage.id',
    operator: 'in',
    value: [],
    type: FieldTypes.DROPDOWN,
    icon: 'mdi-circle-slice-8',
  },
]);

const fields = computed(() => {
  const fields: FieldFilterOption[] = [...defaultFields.value];

  if (listFields.value) {
    listFields.value.forEach((field) => {
      fields.push({
        field: `card.data.${field.id}`,
        title: field.name,
        type: field.type,
        operator: getOperatorFromFieldType(field),
        icon: field.icon,
        options: field.items,
        original: field,
      });
    });
  }

  return fields;
});

const isFiltersFilled = computed(
  () => !!filtersCopy.value?.where && !!filtersCopy.value?.where?.and?.length
);

function clearFilters() {
  filtersCopy.value = { where: { and: [] } };
}

function applyFilters() {
  const areFiltersChanged = !objectUtils.isEqual(
    filtersCopy.value,
    props.filters ?? {
      where: {
        and: [],
      },
    }
  );
  if (areFiltersChanged) {
    emit('update', filtersCopy.value);
    if (!isSnackbarOpen.value) {
      snackbarId.value = showSnackbar({
        message: 'You have unsaved changes.',
        timeout: -1,
        showConfirm: true,
        confirmText: 'Save',
        onConfirm: saveFilters,
      });
      isSnackbarOpen.value = true;
    }
  }
}

const filtersQuery = computed<{
  advanced: FieldFilter[];
  quick: FilterGroup[];
}>(() => {
  const queryFilters = filtersCopy.value.where?.and;

  let filters: { advanced: FieldFilter[]; quick: FilterGroup[] } = {
    advanced: [],
    quick: [],
  };
  if (queryFilters)
    filters = queryFilters.reduce((prev, curr) => {
      if ('or' in curr) {
        prev.quick.push(curr);
      } else if ('value' in curr) {
        prev.advanced.push(curr);
      }
      return prev;
    }, filters);

  return filters;
});

const quickFilterGroupedItems = ref<
  Record<QuickFilterGroup, FieldFilterOption[]>
>(defaultQuickFilterGroupedItems);
const quickFilters = ref<Record<QuickFilterGroup, FieldFilterOption[]>>({
  date: [],
  assignee: [],
  stage: [],
  dropdown: [],
  label: [],
});

function handleQuickFilter() {
  function transformFilter(filter: FieldFilter) {
    return {
      field: filter.field,
      operator: filter.operator,
      value: filter.value,
    };
  }
  function handleInOperator(
    group: QuickFilterGroup,
    field: string
  ): FieldFilter[] {
    const values = quickFilters.value[group]
      .filter((filter) => !['isNull', 'isNotNull'].includes(filter.operator))
      .map((filter: FieldFilter) => filter.value);

    if (values.length) {
      return [
        {
          field,
          operator: 'in',
          value: values,
        },
      ];
    }
    return [];
  }

  const filters: FilterGroup[] = quickFilterGroups
    .map((group: QuickFilterGroup) => {
      let filters: FieldFilter[] = [];

      switch (group) {
        case 'date':
          filters = quickFilters.value[group].filter((filter) =>
            quickFilterGroupedItems.value[group].find(
              (item) => item.title === filter.title
            )
          );
          break;
        case 'stage':
        case 'assignee': {
          const field = group === 'stage' ? 'listStage.id' : 'users.id';
          filters = handleInOperator(group, field);

          quickFilters.value[group]
            .filter((filter) =>
              ['isNull', 'isNotNull'].includes(filter.operator)
            )
            .map((filter) =>
              filters.push({
                field,
                operator: filter.operator,
                value: [],
              })
            );
          break;
        }

        default:
          break;
      }

      if (filters.length) {
        return {
          or: filters.map(transformFilter),
        };
      }
    })
    .filter(Boolean) as FilterGroup[]; // NOTES: https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/#inferred-type-predicates

  filtersCopy.value = {
    where: {
      and: [...filters, ...filtersQuery.value.advanced],
    },
  };
}

function addAdvancedFilter(filterOption: FieldFilterOption) {
  const filter: FieldFilter = {
    field: filterOption.field,
    operator: filterOption.operator,
    value: filterOption.value,
  };

  filtersCopy.value = {
    where: {
      and: [
        ...filtersQuery.value.quick,
        ...filtersQuery.value.advanced,
        filter,
      ],
    },
  };

  closeAddFilterMenu();
}

function handleAdvancedFilter(filter: FieldFilter, index: number) {
  filtersCopy.value = {
    where: {
      and: [
        ...filtersQuery.value.quick,
        ...filtersQuery.value.advanced.slice(0, index),
        filter,
        ...filtersQuery.value.advanced.slice(index + 1),
      ],
    },
  };
}

function removeAdvancedFilter(index: number) {
  filtersCopy.value = {
    where: {
      and: [
        ...filtersQuery.value.quick,
        ...filtersQuery.value.advanced.slice(0, index),
        ...filtersQuery.value.advanced.slice(index + 1),
      ],
    },
  };
}

function closeAddFilterMenu() {
  addFilterMenu.value = false;
}

function saveFilters() {
  emit('save');
  closeSaveSnackbar();
  filtersMenu.value = false;
}

function closeSaveSnackbar() {
  isSnackbarOpen.value = false;
  if (snackbarId.value !== undefined) {
    closeSnackbar(snackbarId.value);
    snackbarId.value = undefined;
  }
}

function getOperatorFromFieldType(field: Field): FilterOperator {
  switch (field.type) {
    case FieldTypes.USER:
    case FieldTypes.DROPDOWN:
    case FieldTypes.LABEL:
    case FieldTypes.CARD:
      return 'in';
    case FieldTypes.DATE:
      return 'between';

    default:
      return 'eq';
  }
}

watch(users, (assignees) => {
  if (assignees) {
    quickFilterGroupedItems.value.assignee =
      defaultQuickFilterGroupedItems.assignee;

    assignees.forEach((assignee) =>
      quickFilterGroupedItems.value.assignee.push({
        field: 'users.id',
        operator: 'eq',
        value: assignee.id,
        title: `${assignee.firstName} ${assignee.lastName}`,
        type: FieldTypes.USER,
      })
    );
  }
});

//TODO debounce changes
watch(
  filtersCopy,
  () => {
    applyFilters();
  },
  { deep: true }
);

watch(
  () => props.filters,
  (v) => {
    if (v) {
      if (!objectUtils.isEqual(filtersCopy.value, v)) {
        filtersCopy.value = cloneDeep(v);
      }
    } else {
      filtersCopy.value = {};
    }
  }
);

watch(
  () => props.viewId,
  () => {
    closeSaveSnackbar();
  }
);

watch(listId, () => {
  refetchListFields();
});
</script>

<template>
  <v-menu v-model="filtersMenu" :close-on-content-click="false" width="750">
    <template #activator="{ props }">
      <base-view-chip
        v-bind="props"
        :icon="isFiltersFilled ? 'mdi-filter' : 'mdi-filter-outline'"
        :label="'Filters'"
        :is-filled="isFiltersFilled"
      >
        <template #append v-if="isFiltersFilled">
          <v-btn
            class="ms-1 me-n2"
            icon="mdi-close"
            size="x-small"
            variant="text"
            density="comfortable"
            @click="clearFilters"
            @click.stop
            color="primary"
            rounded="circle"
          />
        </template>
      </base-view-chip>
    </template>
    <v-card>
      <v-card-text class="pa-0">
        <v-card-item>
          <div class="d-flex">
            <v-card-title> Quick Filters </v-card-title>
            <v-spacer />
            <v-menu v-model="addFilterMenu" :close-on-content-click="false">
              <template #activator="{ props: addFilterProps }">
                <v-btn
                  v-bind="addFilterProps"
                  prepend-icon="mdi-plus"
                  class="text-capitalize"
                  color="default"
                  size="small"
                  variant="tonal"
                >
                  Advanced Filtering
                </v-btn>
              </template>
              <v-card>
                <v-list>
                  <template v-for="field in fields" :key="field.field">
                    <v-list-item
                      @click="addAdvancedFilter(field)"
                      class="text-body-2"
                    >
                      <template #prepend>
                        <v-icon :icon="field.icon" />
                      </template>
                      {{ field.title }}
                    </v-list-item>
                  </template>
                </v-list>
              </v-card>
            </v-menu>
          </div>
          <div
            v-for="(items, group) in quickFilterGroupedItems"
            :key="group"
            class="d-flex align-center"
          >
            <v-card-subtitle class="text-capitalize pa-1 mr-2">
              {{ group }}
            </v-card-subtitle>
            <v-chip-group
              v-model="quickFilters[group]"
              multiple
              selected-class="text-primary"
              @click="handleQuickFilter"
            >
              <v-chip
                v-for="item in items"
                :key="item.title"
                :text="item.title"
                :value="item"
                size="small"
              />
            </v-chip-group>
          </div>
        </v-card-item>
        <v-card-item>
          <v-form ref="filtersForm">
            <template
              v-for="(filter, index) in filtersQuery.advanced"
              :key="filter.type"
            >
              <base-view-chip-filter-item
                v-model="filtersQuery.advanced[index]"
                @update:model-value="
                  (filter) => handleAdvancedFilter(filter, index)
                "
                :index
                :fields
                :users="users ?? []"
                @delete="removeAdvancedFilter"
              />
            </template>
          </v-form>
        </v-card-item>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="saveFilters" color="primary" class="text-capitalize">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
