<script setup lang="ts">
import BaseViewChip from './BaseViewChip.vue';
import {
  ListGroupOptions,
  type List,
  type ViewGroupByOption,
  type ViewGroupOption,
} from '@tillywork/shared';
import posthog from 'posthog-js';
import { useFieldQueryStore } from '@/stores/field.query';

const groupBy = defineModel<ViewGroupByOption>();
const { list } = defineProps<{
  list: List;
}>();

const { groupableFields } = storeToRefs(useFieldQueryStore());

const groupByOptions = computed(() => {
  const arr = [];

  if (list.listStages?.length) {
    arr.push({
      label: 'Stage',
      value: ListGroupOptions.LIST_STAGE,
      icon: 'mdi-circle-slice-8',
    });
  }

  if (groupableFields.value) {
    groupableFields.value.forEach((field) => {
      arr.push({
        label: field.name,
        value: ListGroupOptions.FIELD,
        icon: field.icon,
        field,
      });
    });
  }

  return arr;
});

const selectedOption = computed(() => {
  return groupByOptions.value.find((option) => isOptionSelected(option));
});

const isGroupByFilled = computed(
  () => groupBy.value && groupBy.value.type !== ListGroupOptions.ALL
);

function handleGroupBySelection(option: ViewGroupOption) {
  groupBy.value = {
    type: option.value,
    fieldId: option.field?.id,
  };

  posthog.capture('Updated Group By', {
    groupBy: option.value,
    field: option.field,
  });
}

function isOptionSelected(option: ViewGroupOption) {
  return (
    option.value === groupBy.value?.type &&
    option.field?.id === groupBy.value.fieldId
  );
}

function clearGroupBy() {
  groupBy.value = {
    type: ListGroupOptions.ALL,
  };

  posthog.capture('Updated Group By', {
    groupBy: ListGroupOptions.ALL,
  });
}
</script>

<template>
  <v-menu v-if="groupByOptions.length">
    <template #activator="{ props }">
      <base-view-chip
        v-bind="props"
        icon="mdi-layers-triple-outline"
        :label="'Group' + (isGroupByFilled ? ': ' + selectedOption?.label : '')"
        :is-filled="isGroupByFilled"
      >
        <template #append v-if="isGroupByFilled">
          <v-btn
            class="ms-1 me-n2"
            icon="mdi-close"
            size="x-small"
            variant="text"
            density="comfortable"
            @click="clearGroupBy"
            @click.stop
            color="primary"
            rounded="circle"
          />
        </template>
      </base-view-chip>
    </template>
    <v-card>
      <v-list>
        <template v-for="option in groupByOptions" :key="option.value">
          <v-list-item
            @click="handleGroupBySelection(option)"
            slim
            :active="isOptionSelected(option)"
          >
            <template #prepend>
              <v-icon :color="isOptionSelected(option) ? 'primary' : 'grey'">{{
                option.icon ?? 'mdi-circle-slice-8'
              }}</v-icon>
            </template>
            <v-list-item-title
              class="user-select-none"
              :class="isOptionSelected(option) ? 'font-weight-bold' : ''"
            >
              {{ option.label }}
            </v-list-item-title>
            <template #append>
              <v-icon
                icon="mdi-check"
                size="12"
                v-if="isOptionSelected(option)"
              />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
