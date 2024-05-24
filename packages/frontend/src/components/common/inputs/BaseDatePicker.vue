<script setup lang="ts">
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';
import { useDate } from '@/composables/useDate';

const { dayjs } = useDate();

const dateModel = defineModel<string>();
const dateValue = ref(dateModel.value);

const props = defineProps<{
  label?: string;
  closeOnContentClick?: boolean;
  class?: string;
  icon?: string;
  activatorColor?: string;
}>();
const dateDialog = defineModel<boolean>('dialog', {
  default: false,
});

const processedDate = computed({
  get() {
    const processedDate = dateValue.value
      ? new Date(`${dateValue.value}`)
      : undefined;

    return processedDate;
  },
  set(v) {
    if (v) {
      dateValue.value = v?.toISOString();
    }
  },
});

watch(dateValue, (v) => (dateModel.value = v));

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
</script>

<template>
  <v-menu
    v-model="dateDialog"
    :close-on-content-click="closeOnContentClick ?? false"
    width="fit-content"
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
      v-model="processedDate"
      show-adjacent-months
      color="primary"
    />
  </v-menu>
</template>
