<script setup lang="ts">
import TimePicker from './TimePicker.vue';

import { DATE_RANGE_SUGGESTIONS, type DateRangeSuggestion } from './types';
import objectUtils from '@/utils/object';
import { dayjs } from '@tillywork/shared';

const dateModel = defineModel<string | string[] | null>();

const props = defineProps<{
  label?: string;
  closeOnContentClick?: boolean;
  color?: string;
  class?: string;
  icon?: string;
  activatorColor?: string;
  textField?: boolean;
  range?: boolean;
  rounded?: string;
  includeTime?: boolean;
  fill?: boolean;
}>();

const dateDialog = defineModel<boolean>('dialog', {
  default: false,
});

const dateValue = ref<string | string[] | null | undefined>(dateModel.value);
const timeValue = ref<string>('00:00');
const isTimePickerVisible = ref(false);

const attrs = useAttrs();

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
          const date = dateObject.setHours(12, 0, 0);
          return dayjs(date).utc().format();
        });
      } else {
        const date = v.setHours(12, 0, 0);
        dateValue.value = dayjs(date).utc().format();
      }

      if (props.includeTime) {
        isTimePickerVisible.value = true;
      }
    }
  },
});

function clearDate() {
  dateValue.value = null;
  timeValue.value = '12:00';
  isTimePickerVisible.value = false;
}

const selectedRangeSuggestion = computed(() => {
  return DATE_RANGE_SUGGESTIONS.find((suggestion) => {
    return objectUtils.areArraysEqual(
      suggestion.value,
      (dateValue.value as string[]) ?? []
    );
  });
});

// Combine date and time when applicable
const finalDateTime = computed(() => {
  if (!dateValue.value) return null;

  if (Array.isArray(dateValue.value)) {
    return dateValue.value.map((date) => {
      if (date.startsWith(':')) return date;

      const baseDate = dayjs(date);
      const [hours, minutes] = timeValue.value.split(':').map(Number);

      return baseDate.hour(hours).minute(minutes).utc().format();
    });
  } else {
    if (dateValue.value.startsWith(':')) return dateValue.value;

    const baseDate = dayjs(dateValue.value);
    const [hours, minutes] = timeValue.value.split(':').map(Number);

    return baseDate.hour(hours).minute(minutes).utc().format();
  }
});

watch(finalDateTime, (v) => {
  dateModel.value = v;
});

watch(dateModel, (v) => {
  if (Array.isArray(v) && Array.isArray(dateValue.value)) {
    if (!objectUtils.areArraysEqual(v, dateValue.value)) {
      dateValue.value = v;
    }
  } else {
    if (v !== dateValue.value) {
      dateValue.value = v;

      if (v && !Array.isArray(v)) {
        const parsedDate = dayjs(v);
        timeValue.value = parsedDate.isValid()
          ? parsedDate.format('HH:mm')
          : '00:00';
      }
    }
  }
});

if (dateModel.value && !Array.isArray(dateModel.value)) {
  const parsedDate = dayjs(dateModel.value);
  timeValue.value = parsedDate.isValid() ? parsedDate.format('HH:mm') : '12:00';
}

const textColor = computed(() => {
  if (props.color) {
    return `${props.color}`;
  }

  if (!dateValue.value) {
    return 'default';
  }

  const date = dayjs(
    Array.isArray(dateValue.value) ? dateValue.value[0] : dateValue.value
  );

  if (date < dayjs().startOf('day')) {
    return 'error';
  } else if (date > dayjs().endOf('day')) {
    return 'default';
  } else {
    return 'info';
  }
});

const textClass = computed(() => {
  return props.class + ' ' + (props.fill ? 'flex-fill' : '');
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

    if (props.includeTime && !dateValue.value[0].startsWith(':')) {
      text += ` ${formatTime(timeValue.value)}`;
    }

    return text;
  }

  const baseText = getTextFromDate(dateValue.value);
  return props.includeTime && !dateValue.value.startsWith(':')
    ? `${baseText} ${formatTime(timeValue.value)}`
    : baseText;
});

function formatTime(timeString: string) {
  if (!timeString) return '';

  const [hours, minutes] = timeString.split(':').map(Number);

  const formattedHours = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';

  return `${formattedHours}:${minutes.toString().padStart(2, '0')}${period}`;
}

function getTextFromDate(date: string) {
  /**
   * If the date starts with :
   * it is a placeholder, get
   * label from dateRangeSuggestions
   */
  if (date.startsWith(':')) {
    return selectedRangeSuggestion.value?.title ?? date;
  }

  const localDate = dayjs(date).local();

  if (localDate.isToday()) {
    return 'Today';
  } else if (localDate.isTomorrow()) {
    return 'Tomorrow';
  } else if (localDate.isYesterday()) {
    return 'Yesterday';
  } else {
    return localDate.format('MMM D');
  }
}

function handleSuggestionClick(suggestion: DateRangeSuggestion) {
  dateValue.value = suggestion.value;
}

function confirmDateTime() {
  dateDialog.value = false;
  isTimePickerVisible.value = false;
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
          :rounded
        >
          <template #prepend-inner v-if="icon">
            <v-icon
              size="x-small"
              :icon
              :color="dateDialog ? 'primary-darken-1' : ''"
            />
          </template>
          <template #append-inner v-if="dateValue">
            <base-icon-btn
              icon="mdi-close"
              class="ms-2 align-self-center"
              variant="text"
              rounded="circle"
              @click.prevent.stop="clearDate"
            />
          </template>
        </v-text-field>
      </template>
      <template v-else>
        <v-btn
          v-bind="{
            ...attrs,
            ...props,
          }"
          class="text-none text-caption justify-start font-weight-regular"
          variant="text"
          :color="textColor"
          density="comfortable"
          :class="textClass"
          @click.prevent
          :rounded
        >
          <template #prepend v-if="icon">
            <v-icon :icon color="default" />
          </template>
          <v-tooltip activator="parent" location="top" v-if="!fill && label">
            {{ label }}
          </v-tooltip>
          {{ dateToText }}
          <template #append v-if="dateValue">
            <base-icon-btn
              icon="mdi-close"
              class="align-self-center"
              variant="text"
              rounded="circle"
              size="x-small"
              @click.prevent.stop="clearDate"
            />
          </template>
        </v-btn>
      </template>
    </template>
    <v-container
      fluid
      class="d-flex pa-0 border-thin rounded-md overflow-hidden"
    >
      <v-list
        v-if="range && !isTimePickerVisible"
        width="200"
        max-height="338"
        class="border-e-thin overflow-scroll"
      >
        <template
          v-for="suggestion in DATE_RANGE_SUGGESTIONS"
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

      <v-sheet class="d-flex flex-column">
        <v-date-picker
          v-if="!isTimePickerVisible"
          v-model="processedDate"
          show-adjacent-months
          color="primary"
          border="none"
          hide-header
          :multiple="range ? 'range' : undefined"
          landscape
        />

        <!-- Time Picker Section -->
        <v-sheet
          v-if="includeTime && isTimePickerVisible"
          class="pa-4 border-t-thin"
        >
          <time-picker v-model="timeValue" />
          <div class="d-flex justify-end mt-2">
            <v-btn
              color="primary"
              variant="text"
              class="text-none"
              @click="confirmDateTime"
            >
              Confirm
            </v-btn>
          </div>
        </v-sheet>
      </v-sheet>
    </v-container>
  </v-menu>
</template>
