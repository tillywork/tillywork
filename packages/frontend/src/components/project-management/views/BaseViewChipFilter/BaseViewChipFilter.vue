<script setup lang="ts">
import BaseViewChip from '../BaseViewChip.vue';
import BaseViewChipFilterItem from './BaseViewChipFilterItem.vue';
import { FieldTypes, type Field } from '../../fields/types';
import type { VForm } from 'vuetify/components';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import { useWorkspaceStore } from '@/stores/workspace';
import type {
  QueryFilter,
  FieldFilter,
  FilterOperator,
} from '../../filters/types';
import type { FieldFilterOption } from './types';
import { useFieldsService } from '@/composables/services/useFieldsService';

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
const { selectedWorkspace } = storeToRefs(useWorkspaceStore());
const { useProjectUsersQuery } = useProjectUsersService();

const { data: users } = useProjectUsersQuery({
  projectId: selectedWorkspace.value!.projectId,
  select: (projectUsers) => projectUsers.map((pj) => pj.user),
});

const { data: workspaceFields } = useFieldsQuery({
  workspaceId: selectedWorkspace.value!.id,
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
  //   {
  //     title: 'Status',
  //     field: 'status',
  //     operator: 'eq',
  //     value: 'open',
  //     type: FieldTypes.DROPDOWN,
  //     icon: 'mdi-list-status',
  //   },
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
]);

const fields = computed(() => {
  const fields: FieldFilterOption[] = [...defaultFields.value];

  if (workspaceFields.value) {
    workspaceFields.value.forEach((field) => {
      fields.push({
        field: `card.data.${field.id}`,
        title: field.name,
        type: field.type,
        operator: getOperatorFromFieldType(field),
        icon: field.icon,
        options: field.items,
      });
    });
  }

  return fields;
});

const isFiltersFilled = computed(
  () => !!filtersCopy.value?.where && !!filtersCopy.value?.where?.and?.length
);

function clearFilters() {
  filtersCopy.value = { where: {} };
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

function addFilter(filterOption: FieldFilterOption) {
  const filter: FieldFilter = {
    field: filterOption.field,
    operator: filterOption.operator,
    value: filterOption.value,
  };

  filtersCopy.value =
    filtersCopy.value && filtersCopy.value.where?.and
      ? {
          where: {
            and: [...filtersCopy.value.where.and, filter],
          },
        }
      : {
          where: {
            and: [filter],
          },
        };

  closeAddFilterMenu();
}

function removeFilter(index: number) {
  filtersCopy.value = {
    where: {
      and: [
        ...filtersCopy.value.where!.and!.slice(0, index),
        ...filtersCopy.value.where!.and!.slice(index + 1),
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
      return 'in';
    case FieldTypes.DATE:
      return 'between';

    default:
      return 'eq';
  }
}

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
    }
  }
);

watch(
  () => props.viewId,
  () => {
    closeSaveSnackbar();
  }
);
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
      <v-card-title class="text-body-2"> Filter Builder </v-card-title>
      <v-card-text class="pa-0">
        <!--TODO-->
        <!-- <v-card-item>
          Quick Filters
        </v-card-item> -->
        <v-card-item
          v-if="filtersCopy.where?.and && filtersCopy.where.and.length > 0"
        >
          <v-form ref="filtersForm">
            <template
              v-for="(filter, index) in filtersCopy.where?.and"
              :key="filter.type"
            >
              <base-view-chip-filter-item
                v-model="filtersCopy.where.and[index]"
                :index
                :fields
                :users="users ?? []"
                @delete="removeFilter"
              />
            </template>
          </v-form>
        </v-card-item>
        <v-card-item>
          <v-menu v-model="addFilterMenu" :close-on-content-click="false">
            <template #activator="{ props: addFilterProps }">
              <v-btn
                v-bind="addFilterProps"
                prepend-icon="mdi-plus"
                class="text-capitalize mt-3"
                color="default"
                size="small"
                >Filter</v-btn
              >
            </template>
            <v-card>
              <v-list>
                <template v-for="field in fields" :key="field.field">
                  <v-list-item @click="addFilter(field)" class="text-body-2">
                    <template #prepend>
                      <v-icon :icon="field.icon" />
                    </template>
                    {{ field.title }}
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </v-menu>
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
