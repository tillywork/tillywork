<script setup lang="ts">
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';
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
}>();
const dateDialog = defineModel<boolean>('dialog', {
  default: false,
});

const dateValue = ref<string | string[] | null | undefined>(dateModel.value);

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
          const date = dateObject.setHours(23, 59, 59);
          return dayjs(date).utc().format();
        });
      } else {
        const date = v.setHours(23, 59, 59);
        dateValue.value = dayjs(date).utc().format();
      }
    }
  },
});

function clearDate() {
  dateValue.value = null;
}

const selectedRangeSuggestion = computed(() => {
  return DATE_RANGE_SUGGESTIONS.find((suggestion) => {
    return objectUtils.areArraysEqual(
      suggestion.value,
      (dateValue.value as string[]) ?? []
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

watch(dateModel, (v) => {
  if (Array.isArray(v) && Array.isArray(dateValue.value)) {
    if (!objectUtils.areArraysEqual(v, dateValue.value)) {
      dateValue.value = v;
    }
  } else {
    if (v !== dateValue.value) {
      dateValue.value = v;
    }
  }
});

const textColorClass = computed(() => {
  if (props.color) {
    return `text-${props.color}`;
  }

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
        <base-card-property-value-btn
          v-bind="props"
          class="text-none text-caption justify-start font-weight-regular"
          :class="textClass"
          @click.prevent
          :rounded
        >
          <template #prepend v-if="icon">
            <v-icon :icon color="default" />
          </template>
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
