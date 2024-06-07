<script setup lang="ts">
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';
import { useDate } from '@/composables/useDate';

const { dayjs } = useDate();

const dateModel = defineModel<string | string[]>();
const dateValue = ref<string | string[] | undefined>(dateModel.value);

const props = defineProps<{
  label?: string;
  closeOnContentClick?: boolean;
  class?: string;
  icon?: string;
  activatorColor?: string;
  textField?: boolean;
  range?: boolean;
}>();
const dateDialog = defineModel<boolean>('dialog', {
  default: false,
});

const processedDate = computed({
  get() {
    if (Array.isArray(dateValue.value)) {
      return dateValue.value.map((dateString) => new Date(dateString));
    }

    return dateValue.value ? new Date(dateValue.value) : undefined;
  },
  set(v) {
    if (v) {
      if (Array.isArray(v)) {
        dateValue.value = v.map((dateObject) => dateObject.toISOString());
      } else {
        dateValue.value = v.toISOString();
      }
    }
  },
});

watch(dateValue, (v) => {
  if (Array.isArray(v)) {
    if (v.length > 1) {
      dateModel.value = [v[0], v[v.length - 1]];
    } else {
      dateModel.value = v;
    }
  } else {
    dateModel.value = v;
  }
});

const textColorClass = computed(() => {
  if (!dateValue.value) {
    return 'text-default';
  }

  const date = dayjs(
    Array.isArray(dateValue.value) ? dateValue.value[0] : dateValue.value
  );

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
    return props.label ?? 'Select date';
  }

  if (Array.isArray(dateValue.value)) {
    let text = getTextFromDate(dateValue.value[0]);

    if (dateValue.value.length > 1) {
      text +=
        ' ~ ' + getTextFromDate(dateValue.value[dateValue.value.length - 1]);
    }

    return text;
  }

  return getTextFromDate(dateValue.value);
});

function getTextFromDate(date: string) {
  if (dayjs(date).isToday()) {
    return 'Today';
  } else if (dayjs(dateValue.value).isTomorrow()) {
    return 'Tomorrow';
  } else if (dayjs(dateValue.value).isYesterday()) {
    return 'Yesterday';
  } else {
    return dayjs(date).format('MMM D');
  }
}
</script>

<template>
  <v-menu
    v-model="dateDialog"
    :close-on-content-click="closeOnContentClick ?? false"
    width="fit-content"
  >
    <template #activator="{ props }">
      <template v-if="textField">
        <v-text-field
          v-bind="props"
          :value="dateToText"
          readonly
          single-line
          hide-details
        />
      </template>
      <template v-else>
        <base-card-property-value-btn
          v-bind="props"
          :class="textClass"
          @click.prevent
        >
          <template #prepend v-if="icon">
            <v-icon :icon color="default" />
          </template>
          {{ dateToText }}
        </base-card-property-value-btn>
      </template>
    </template>
    <v-date-picker
      v-model="processedDate"
      show-adjacent-months
      color="primary"
      hide-header
      :multiple="range ? 'range' : undefined"
      landscape
    />
  </v-menu>
</template>
