<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';

const dateValue = defineModel<string | Date>();
const props = defineProps<{
  noDateMessage?: string;
  closeOnContentClick?: boolean;
  class?: string;
}>();
const dateDialog = ref(false);

const textColorClass = computed(() => {
  if (!dateValue.value) {
    return 'text-default';
  }

  const date = dayjs(dateValue.value);

  if (date < dayjs().startOf('day')) {
    return 'text-error';
  } else if (date > dayjs().endOf('day')) {
    return 'text-default';
  } else {
    return 'text-info';
  }
});

const textClass = computed(() => {
  return textColorClass.value + ' ' + props.class;
});
</script>

<template>
  <v-menu
    v-model="dateDialog"
    :close-on-content-click="closeOnContentClick ?? false"
  >
    <template #activator="{ props }">
      <base-card-property-value-btn v-bind="props" :class="textClass">
        <template v-if="dateValue">
          {{ dayjs(dateValue).format('MMM D') ?? 'Empty' }}
        </template>
        <template v-else>
          {{ noDateMessage ?? 'No Date Selected' }}
        </template>
      </base-card-property-value-btn>
    </template>
    <v-date-picker v-model="dateValue" show-adjacent-months color="primary" />
  </v-menu>
</template>
