<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';
import isToday from 'dayjs/plugin/isToday';
import { onMounted } from 'vue';

dayjs.extend(isToday);

const dateValue = defineModel<string | Date>();
const props = defineProps<{
  label?: string;
  closeOnContentClick?: boolean;
  class?: string;
  icon?: string;
}>();
const dateDialog = defineModel<boolean>('dialog', {
  default: false,
});

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
    return props.label ?? 'Empty';
  }

  if (dayjs(dateValue.value).isToday()) {
    return 'Today';
  } else {
    return dayjs(dateValue.value).format('MMM D');
  }
});

onMounted(() => {
  if (typeof dateValue.value === 'string') {
    dateValue.value = new Date(dateValue.value);
  }
});
</script>

<template>
  <v-menu
    v-model="dateDialog"
    :close-on-content-click="closeOnContentClick ?? false"
    offset="3"
  >
    <template #activator="{ props }">
      <base-card-property-value-btn v-bind="props" :class="textClass">
        <template #prepend v-if="icon">
          <v-icon :icon color="default" />
        </template>
        {{ dateToText }}
      </base-card-property-value-btn>
    </template>
    <v-date-picker
      v-model="dateValue"
      show-adjacent-months
      color="primary"
      bg-color="accent"
    />
  </v-menu>
</template>
