<script setup lang="ts">
import BaseViewChip from '../BaseViewChip.vue';
import { FieldTypes } from '../../fields/types';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import type { FieldFilter, ViewFilter } from '../../filters/types';
import type { FieldFilterOption } from './types';
import { useFieldsService } from '@/composables/services/useFieldsService';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useAuthStore } from '@/stores/auth';
import { useStateStore } from '@/stores/state';
import QuickFilters from './QuickFilters.vue';
import AdvancedFilters from './AdvancedFilters.vue';
import { filterUtils } from '@/utils/filter';

const props = defineProps<{
  filters?: ViewFilter;
  viewId: number;
}>();
const emit = defineEmits(['save', 'update']);

const filtersMenu = ref(false);
const addAdvancedFilterMenu = ref(false);
const filtersCopy = ref<ViewFilter>(
  props.filters ? cloneDeep({ ...props.filters }) : { where: {} }
);
const isSnackbarOpen = ref(false);
const snackbarId = ref<number>();

const { useFieldsQuery } = useFieldsService();
const { showSnackbar, closeSnackbar } = useSnackbarStore();
const { project } = storeToRefs(useAuthStore());
const { useProjectUsersQuery } = useProjectUsersService();

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
        operator: filterUtils.getOperatorFromFieldType(field),
        icon: field.icon,
        options: field.items,
        original: field,
      });
    });
  }

  return fields;
});

const isFiltersFilled = computed(
  () =>
    (!!filtersCopy.value?.where.advanced &&
      !!filtersCopy.value?.where.advanced?.and?.length) ||
    (!!filtersCopy.value?.where.quick &&
      !!filtersCopy.value?.where.quick?.and?.length)
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

function addAdvancedFilter(filterOption: FieldFilterOption) {
  const filter: FieldFilter = {
    field: filterOption.field,
    operator: filterOption.operator,
    value: filterOption.value,
  };

  filtersCopy.value = {
    ...filtersCopy.value,
    where: {
      quick: filtersCopy.value.where.quick,
      advanced: {
        and: [...(filtersCopy.value.where.advanced?.and ?? []), filter],
      },
    },
  };

  addAdvancedFilterMenu.value = false;
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
      filtersCopy.value = { where: {} };
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
            <v-menu
              v-model="addAdvancedFilterMenu"
              :close-on-content-click="false"
            >
              <template #activator="{ props: addFilterProps }">
                <v-btn
                  v-bind="addFilterProps"
                  prepend-icon="mdi-plus"
                  class="text-capitalize"
                  color="default"
                  size="small"
                  variant="tonal"
                >
                  Create Custom Filter
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
          <quick-filters
            v-model="filtersCopy.where.quick"
            :list-stages="listStages ?? []"
            :list-fields="listFields ?? []"
            :users="users ?? []"
          />
        </v-card-item>
        <v-card-item>
          <advanced-filters
            v-model="filtersCopy.where.advanced"
            :fields
            :users="users ?? []"
          />
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
