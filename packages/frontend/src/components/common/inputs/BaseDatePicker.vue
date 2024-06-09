<script setup lang="ts">
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';
import { useDate } from '@/composables/useDate';
import type { DateRangeSuggestion } from './types';
import objectUtils from '@/utils/object';

const { dayjs } = useDate();

const dateModel = defineModel<string | string[]>();

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

const dateValue = ref<string | string[] | undefined>(dateModel.value);

const processedDate = computed({
  get() {
    if (Array.isArray(dateValue.value)) {
      /**
       * If the date starts with :
       * it is a placeholder, don't
       * return a value
       */
      if (dateValue.value[0].startsWith(':')) {
        return undefined;
      } else {
        return dateValue.value.map((dateString) => {
          return new Date(dateString);
        });
      }
    }

    /**
     * If the date starts with :
     * it is a placeholder, don't
     * return a value
     */
    if (dateValue.value?.startsWith(':')) {
      return undefined;
    } else {
      return dateValue.value ? new Date(dateValue.value) : undefined;
    }
  },
  set(v) {
    if (v) {
      if (Array.isArray(v)) {
        dateValue.value = v.map((dateObject) => {
          return dateObject.toISOString();
        });
      } else {
        dateValue.value = v.toISOString();
      }
    }
  },
});

const selectedRangeSuggestion = computed(() => {
  return dateRangeSuggestions.find((suggestion) => {
    return objectUtils.areArraysEqual(
      suggestion.value,
      dateValue.value as string[]
    );
  });
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

    if (dateValue.value.length > 1 && !dateValue.value[0].startsWith(':')) {
      text +=
        ' ~ ' + getTextFromDate(dateValue.value[dateValue.value.length - 1]);
    }

    return text;
  }

  return getTextFromDate(dateValue.value);
});

/**
 * Today
 * Yesterday
 * Tomorrow
 * Next 7 days
 * Last 7 days
 * This week
 * Next week
 * Last week
 * Last month
 * This month
 * Next month
 * Today & earlier
 * Later than today
 * Last Quarter
 * This Quarter
 * Next Quarter
 * Overdue
 * Next year
 * This year
 * Last Year
 * Exact date
 * Before date
 * After date
 * Date range
 */
//TODO update value on suggestion click
/**
 * Suggestions for date ranges.
 * Used to set query value and operator
 * when looking for specific data, or
 * selecting a dynamic date range.
 */
const dateRangeSuggestions: DateRangeSuggestion[] = [
  {
    title: 'Today',
    value: [':startOfDay', ':endOfDay'],
  },
  {
    title: 'Yesterday',
    value: [':startOfYesterday', ':endOfYesterday'],
  },
  {
    title: 'Tomorrow',
    value: [':startOfTomorrow', ':endOfTomorrow'],
  },
  {
    title: 'This week',
    value: [':startOfWeek', ':endOfWeek'],
  },
  {
    title: 'Next week',
    value: [':startOfNextWeek', ':endOfNextWeek'],
  },
  {
    title: 'Last week',
    value: [':startOfLastWeek', ':endOfLastWeek'],
  },
  {
    title: 'This month',
    value: [':startOfMonth', ':endOfMonth'],
  },
  {
    title: 'Next month',
    value: [':startOfNextMonth', ':endOfNextMonth'],
  },
  {
    title: 'Last month',
    value: [':startOfLastMonth', ':endOfLastMonth'],
  },
  {
    title: 'This year',
    value: [':startOfYear', ':endOfYear'],
  },
  {
    title: 'Next year',
    value: [':startOfNextYear', ':endOfNextYear'],
  },
  {
    title: 'Last year',
    value: [':startOfLastYear', ':endOfLastYear'],
  },
  {
    title: 'Today and earlier',
    value: [':startOfTime', ':endOfDay'],
  },
  {
    title: 'Later than today',
    value: [':endOfDay', ':endOfTime'],
  },
  {
    title: 'Overdue',
    value: [':startOfTime', ':startOfDay'],
  },
];

function getTextFromDate(date: string) {
  /**
   * If the date starts with :
   * it is a placeholder, get
   * label from dateRangeSuggestions
   */
  if (date.startsWith(':')) {
    return selectedRangeSuggestion.value?.title ?? date;
  }

  if (dayjs(date).isToday()) {
    return 'Today';
  } else if (dayjs(date).isTomorrow()) {
    return 'Tomorrow';
  } else if (dayjs(date).isYesterday()) {
    return 'Yesterday';
  } else {
    return dayjs(date).format('MMM D');
  }
}

function handleSuggestionClick(suggestion: DateRangeSuggestion) {
  dateValue.value = suggestion.value;
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
    <v-container
      fluid
      class="d-flex pa-0 border-thin rounded-md overflow-hidden"
    >
      <v-list
        v-if="range"
        width="200"
        max-height="338"
        class="border-e-thin overflow-scroll"
      >
        <template
          v-for="suggestion in dateRangeSuggestions"
          :key="suggestion.title"
        >
          <v-list-item
            @click="handleSuggestionClick(suggestion)"
            :active="suggestion.title === selectedRangeSuggestion?.title"
          >
            <v-list-item-title>{{ suggestion.title }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
      <v-date-picker
        v-model="processedDate"
        show-adjacent-months
        color="primary"
        border="none"
        hide-header
        :multiple="range ? 'range' : undefined"
        landscape
      />
    </v-container>
  </v-menu>
</template>
