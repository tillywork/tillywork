<script setup lang="ts">
import AdvancedFiltersItem from './AdvancedFiltersItem.vue';
import type { VForm } from 'vuetify/components';
import {
  type FilterGroup,
  type FieldFilterOption,
  type User,
  type FieldFilter,
} from '@tillywork/shared';

const advancedFilters = defineModel<FilterGroup>({
  required: true,
  default: {
    and: [],
  },
});

defineProps<{
  fields: FieldFilterOption[];
  users: User[];
}>();

const filtersForm = ref<VForm>();

function removeAdvancedFilter(index: number) {
  advancedFilters.value = {
    and: [
      ...advancedFilters.value.and!.slice(0, index),
      ...advancedFilters.value.and!.slice(index + 1),
    ],
  };
}
</script>

<template>
  <v-form ref="filtersForm" v-if="advancedFilters.and">
    <template
      v-for="(filter, index) in advancedFilters?.and"
      :key="filter.type"
    >
      <advanced-filters-item
        v-model="advancedFilters.and[index] as FieldFilter"
        :index
        :fields
        :users
        @delete="removeAdvancedFilter"
      />
    </template>
    <template v-if="!advancedFilters.and.length">
      <div class="d-flex flex-column align-center justify-center my-6">
        <span class="text-body-1 font-weight-medium mb-4"
          >Let's get started!</span
        >
        <span class="text-body-3"
          >To filter your view, click Add New Filter and select the field you
          want to filter on.</span
        >
      </div>
    </template>
  </v-form>
</template>
