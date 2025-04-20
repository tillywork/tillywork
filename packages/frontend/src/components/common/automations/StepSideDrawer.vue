<script setup lang="ts">
import { useAutomationService } from '@/services/useAutomationService';

import _ from 'lodash';

import {
  ActionType,
  AutomationStepType,
  TriggerType,
  type Automation,
  type AutomationFieldSchema,
  type AutomationHandlerMetadata,
  type AutomationStep,
} from '@tillywork/shared';

import StepField from './StepField/StepField.vue';
import StepOptionsList from './StepOptionsList.vue';

const step = defineModel<AutomationStep | null>({
  default: null,
});
const isOpen = defineModel('open', { default: false });
const { automation } = defineProps<{
  automation: Automation;
}>();
const isTrigger = computed(
  () => step.value?.type === AutomationStepType.TRIGGER
);

const actions = inject<Ref<AutomationHandlerMetadata[]>>('actions', ref([]));
const triggers = inject<Ref<AutomationHandlerMetadata[]>>('triggers', ref([]));

const { useGetHandlerFields } = useAutomationService();
const { data: fields, refetch: refetchFields } = useGetHandlerFields({
  automationId: automation.id,
  handler: computed(() => step.value?.value as ActionType | TriggerType),
  data: computed(() => step.value?.data),
  enabled: computed(() => !!step.value && !!step.value.value),
});

const options = computed<AutomationHandlerMetadata[]>(() => {
  if (isTrigger.value) {
    return triggers.value;
  }

  return actions.value;
});

const selectedOption = computed(() =>
  options.value?.find((option) => option.value === step.value?.value)
);

const stepData = computed(() => _.cloneDeep(step.value?.data));

const closeDrawer = () => {
  isOpen.value = false;
};

const didFieldRefreshersChange = (
  field: AutomationFieldSchema,
  changedFields: string[]
) => {
  return (
    field.refreshers?.some((slug) => changedFields.includes(slug)) ?? false
  );
};

const isFieldARefresher = (
  field: AutomationFieldSchema,
  key: string,
  changedFields: string[]
) => {
  return (
    (changedFields.includes(key) &&
      field.refreshers &&
      field.refreshers?.length == 0) ??
    false
  );
};

watch(stepData, (oldData, newData) => {
  if (!oldData || !newData || !fields.value) return;

  const changedFields: string[] = [];
  for (const [key, value] of Object.entries(newData)) {
    if (!_.isEqual(value, oldData[key])) {
      changedFields.push(key);
    }
  }

  const shouldRefresh = Object.entries(fields.value)
    .map(([key, field]) => {
      const fieldRefreshersChanged = didFieldRefreshersChange(
        field,
        changedFields
      );

      if (fieldRefreshersChanged && step.value) {
        step.value.data[key] = undefined;
      }

      const fieldIsRefresher = isFieldARefresher(field, key, changedFields);

      return fieldRefreshersChanged || fieldIsRefresher;
    })
    .filter(Boolean);

  if (shouldRefresh?.length) {
    refetchFields();
  }
});
</script>

<template>
  <v-navigation-drawer
    v-model="isOpen"
    location="right"
    width="400"
    overlay-opacity="0.2"
  >
    <v-card class="h-100 pa-2 step-side-drawer overflow-auto">
      <v-card-title class="d-flex align-center px-4 py-3 ga-2">
        <v-icon :icon="selectedOption?.icon" class="me-2" size="20" />
        <span class="text-body-2 text-high-emphasis">
          {{ selectedOption?.title }}
        </span>

        <v-menu>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="transparent"
              icon
              size="small"
              v-tooltip="'Change handler'"
            >
              <v-icon icon="mdi-chevron-down" size="20" />
            </v-btn>
          </template>
          <step-options-list v-if="step" v-model="step" />
        </v-menu>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          color="default"
          density="comfortable"
          @click="closeDrawer"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <template v-if="fields && step">
        <template
          v-for="[key, field] in Object.entries(fields)"
          :key="field.title"
        >
          <div class="mt-2 mb-6 px-2">
            <p class="text-caption font-weight-light mb-1">
              {{ field.title }} <template v-if="field.required">*</template>
            </p>
            <step-field v-model="step.data[key]" v-bind="field" />
          </div>
        </template>
      </template>
    </v-card>
  </v-navigation-drawer>
</template>
