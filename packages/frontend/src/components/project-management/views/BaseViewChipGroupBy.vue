<script setup lang="ts">
import { DEFAULT_LIST_GROUP_BY_OPTIONS } from '../lists/types';
import type { ListGroupOption } from './types';
import BaseViewChip from './BaseViewChip.vue';
import { ListGroupOptions, type ViewGroupByOption } from '@tillywork/shared';
import { useFields } from '@/composables/useFields';
import { useStateStore } from '@/stores/state';
import posthog from 'posthog-js';

const groupBy = defineModel<ViewGroupByOption>();

const { currentList } = storeToRefs(useStateStore());
const cardTypeId = computed(() => currentList.value?.defaultCardType.id ?? 0);
const listId = computed(() => currentList.value?.id ?? 0);
const fieldsEnabled = computed(() => !!currentList.value);

const { groupableFields } = useFields({
  cardTypeId,
  listId,
  enabled: fieldsEnabled,
});

const groupByOptions = computed(() => {
  const arr = [...DEFAULT_LIST_GROUP_BY_OPTIONS];

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

function handleGroupBySelection(option: ListGroupOption) {
  groupBy.value = {
    type: option.value,
    fieldId: option.field?.id,
  };

  posthog.capture('update_group_by', {
    groupBy: option.value,
    field: option.field,
  });
}

function isOptionSelected(option: ListGroupOption) {
  return (
    option.value === groupBy.value?.type &&
    option.field?.id === groupBy.value.fieldId
  );
}

function clearGroupBy() {
  groupBy.value = {
    type: ListGroupOptions.ALL,
  };

  posthog.capture('update_group_by', {
    groupBy: ListGroupOptions.ALL,
  });
}
</script>

<template>
  <v-menu>
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
