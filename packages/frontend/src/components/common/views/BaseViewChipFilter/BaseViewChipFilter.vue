<script setup lang="ts">
import BaseViewChip from '../BaseViewChip.vue';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import QuickFilters from './QuickFilters.vue';
import AdvancedFilters from './AdvancedFilters.vue';
import { filterUtils } from '@/utils/filter';
import {
  type ViewFilter,
  FieldTypes,
  type FieldFilter,
  type FieldFilterOption,
  type FilterViewOptions,
  type FilterGroup,
} from '@tillywork/shared';
import posthog from 'posthog-js';
import { useFieldQueryStore } from '@/stores/field.query';
import { useQueryStore } from '@/stores/query';

const { filters, viewId } = defineProps<{
  filters?: ViewFilter;
  viewId: number;
}>();
const emit = defineEmits(['save', 'update']);

const filtersMenu = ref(false);
const addAdvancedFilterMenu = ref(false);
const filtersCopy = ref<ViewFilter>(
  filters
    ? cloneDeep({ ...filters })
    : { where: { quick: { and: [] }, advanced: { and: [] } } }
);
const viewType = ref<FilterViewOptions>('quick');
const isSnackbarOpen = ref(false);
const snackbarId = ref<number>();

const { showSnackbar, closeSnackbar } = useSnackbarStore();
const { listStages, users } = storeToRefs(useQueryStore());
const { filterableFields } = storeToRefs(useFieldQueryStore());

const filtersMenuWidth = computed(() =>
  viewType.value === 'quick' ? 300 : 750
);

const fields = computed(() => {
  const fields: FieldFilterOption[] = [];

  if (listStages.value?.length) {
    fields.push({
      title: 'Stage',
      field: 'listStage.id',
      operator: 'in',
      value: [],
      type: FieldTypes.DROPDOWN,
      icon: 'mdi-circle-slice-8',
    });
  }

  if (filterableFields.value) {
    filterableFields.value.forEach((field) => {
      fields.push({
        field: `card.data.${field.slug}`,
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

const isFiltersFilled = computed(() => filtersCount.value > 0);

const filtersCount = computed(
  () =>
    (filtersCopy.value.where.quick?.and?.length ?? 0) +
    (filtersCopy.value.where.advanced?.and?.length ?? 0)
);

const otherViewTypeFiltersCount = computed(() => {
  if (viewType.value === 'quick') {
    return filtersCopy.value.where.advanced?.and?.length ?? 0;
  } else {
    return filtersCopy.value.where.quick?.and?.length ?? 0;
  }
});

function clearFilters() {
  filtersCopy.value = { where: {} };
}

function applyFilters() {
  const areFiltersChanged = !objectUtils.isEqual(
    filtersCopy.value,
    filters ?? {
      where: {
        quick: {
          and: [],
        },
        advanced: {
          and: [],
        },
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

    posthog.capture('Updated Filters', {
      viewId: viewId,
    });
  }
}

function addAdvancedFilter(filterOption: FieldFilterOption) {
  viewType.value = 'advanced';

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

function toggleViewType() {
  viewType.value = viewType.value === 'quick' ? 'advanced' : 'quick';

  if (
    viewType.value === 'advanced' &&
    !filtersCopy.value.where.advanced?.and?.length
  ) {
    addAdvancedFilterMenu.value = true;
  }
}

onBeforeUnmount(() => {
  closeSaveSnackbar();
});

watch(
  filtersCopy,
  () => {
    applyFilters();
  },
  { deep: true }
);

watch(
  () => filters,
  (v) => {
    if (v) {
      if (!objectUtils.isEqual(filtersCopy.value, v)) {
        filtersCopy.value = cloneDeep(v);
      }
    } else {
      filtersCopy.value = {
        where: { quick: { and: [] }, advanced: { and: [] } },
      };
    }
  }
);

watch(
  () => viewId,
  () => {
    closeSaveSnackbar();
  }
);
</script>

<template>
  <v-menu
    v-model="filtersMenu"
    :close-on-content-click="false"
    :width="filtersMenuWidth"
  >
    <template #activator="{ props }">
      <base-view-chip
        v-bind="props"
        :icon="isFiltersFilled ? 'mdi-filter' : 'mdi-filter-outline'"
        :label="'Filters' + (isFiltersFilled ? `: ${filtersCount}` : '')"
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
        <v-card-item v-if="viewType === 'quick'">
          <quick-filters
            v-model="filtersCopy.where.quick as FilterGroup"
            :list-stages="listStages ?? []"
            :fields="filterableFields ?? []"
            :users="users ?? []"
          />
        </v-card-item>
        <v-card-item v-else>
          <advanced-filters
            v-model="filtersCopy.where.advanced as FilterGroup"
            :fields
            :users="users ?? []"
          />
          <v-menu
            v-model="addAdvancedFilterMenu"
            :close-on-content-click="false"
          >
            <template #activator="{ props: addFilterProps }">
              <v-btn
                v-bind="addFilterProps"
                prepend-icon="mdi-plus"
                class="text-capitalize mt-4"
                color="default"
                size="small"
              >
                Add New Filter
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
        </v-card-item>
      </v-card-text>
      <v-card-actions>
        <v-btn
          @click="toggleViewType"
          class="text-capitalize text-caption"
          color="default"
        >
          {{ viewType === 'quick' ? 'Advanced' : 'quick' }} Filters ({{
            otherViewTypeFiltersCount
          }})
        </v-btn>
        <v-spacer />
        <v-btn @click="saveFilters" class="text-capitalize text-body-3">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
