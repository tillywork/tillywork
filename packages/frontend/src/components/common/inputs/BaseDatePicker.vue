<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';
import isToday from 'dayjs/plugin/isToday';

dayjs.extend(isToday);

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

const dateToText = computed(() => {
  if (!dateValue.value) {
    return props.noDateMessage ?? 'Empty';
  }

  if (dayjs(dateValue.value).isToday()) {
    return 'Today';
  } else {
    return dayjs(dateValue.value).format('MMM D');
  }
});
</script>

<template>
  <v-menu
    v-model="dateDialog"
    :close-on-content-click="closeOnContentClick ?? false"
  >
    <template #activator="{ props }">
      <base-card-property-value-btn v-bind="props" :class="textClass">
        {{ dateToText }}
      </base-card-property-value-btn>
    </template>
    <v-date-picker v-model="dateValue" show-adjacent-months color="primary" />
  </v-menu>
</template>
