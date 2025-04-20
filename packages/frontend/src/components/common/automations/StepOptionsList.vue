<script setup lang="ts">
import { useListKeyboardNavigation } from '@/composables/useListKeyboardNavigation';

import stringUtils from '@/utils/string';

import {
  ActionType,
  type AutomationHandlerMetadata,
  type AutomationStep,
  AutomationStepType,
  TriggerType,
} from '@tillywork/shared';

import StepOptionsItem from './StepOptionsItem.vue';
import SmallTextInput from '../inputs/SmallTextInput.vue';

const step = defineModel<AutomationStep>({
  default: null,
});

const isTrigger = computed(
  () => step.value.type === AutomationStepType.TRIGGER
);
const options = inject<Ref<AutomationHandlerMetadata[]>>(
  isTrigger.value ? 'triggers' : 'actions',
  ref([])
);
const optionSearch = ref('');

const { containerRef, activeIndex } = useListKeyboardNavigation({});

const filteredTriggerOptions = computed<AutomationHandlerMetadata[]>(() => {
  // Each time the options change, reset keyboard navigation position
  activeIndex.value =
    options.value.findIndex((option) =>
      isOptionSelected(option.value as TriggerType)
    ) ?? 0;

  if (!optionSearch.value) return options.value;

  return options.value.filter((option) =>
    stringUtils.fuzzySearch(optionSearch.value, option.title)
  );
});

const triggerOptionsBySection = computed(() => {
  return filteredTriggerOptions.value.reduce((sections, option) => {
    const section = option.section;
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push(option);
    return sections;
  }, {} as Record<string, AutomationHandlerMetadata[]>);
});

const showNoResults = computed(() => !filteredTriggerOptions.value.length);

const isOptionSelected = (optionValue: TriggerType | ActionType) => {
  return optionValue === step.value?.value;
};

const handleUpdateOption = (optionValue: TriggerType | ActionType) => {
  step.value = {
    ...step.value,
    value: optionValue,
  };
};
</script>

<template>
  <v-card width="300" color="dialog">
    <div class="pa-2 pb-1">
      <small-text-input v-model="optionSearch" label="Search.." autofocus />
    </div>
    <v-list
      ref="containerRef"
      class="pt-0"
      nav
      bg-color="transparent"
      max-height="350"
    >
      <template
        v-for="(options, section) in triggerOptionsBySection"
        :key="section"
      >
        <v-list-subheader class="text-caption">
          {{ section }}
        </v-list-subheader>

        <template v-for="item in options" :key="item.label">
          <step-options-item
            :item
            @click="handleUpdateOption(item.value)"
            :active="item.value === filteredTriggerOptions[activeIndex]?.value"
            :selected="isOptionSelected(item.value)"
          />
        </template>
      </template>

      <template v-if="showNoResults">
        <v-list-item min-height="30">
          <template #prepend>
            <v-icon icon="mdi-alert-circle" />
          </template>
          <v-list-item-title class="text-medium-emphasis"
            >No results found.</v-list-item-title
          >
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>
