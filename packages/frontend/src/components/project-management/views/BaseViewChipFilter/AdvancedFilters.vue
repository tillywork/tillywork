<script setup lang="ts">
import type { User } from '@/components/common/users/types';
import type { FilterGroup } from '../../filters/types';
import AdvancedFiltersItem from './AdvancedFiltersItem.vue';
import type { FieldFilterOption } from './types';
import type { VForm } from 'vuetify/components';

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
        v-model="advancedFilters.and[index]"
        :index
        :fields
        :users
        @delete="removeAdvancedFilter"
      />
    </template>
  </v-form>
</template>
