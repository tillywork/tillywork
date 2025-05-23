<script setup lang="ts">
import {
  ActionType,
  AutomationStepType,
  TriggerType,
  type AutomationHandlerMetadata,
  type AutomationStep,
} from '@tillywork/shared';

import StepOptionsList from './StepOptionsList.vue';
import { useAutomationService } from '@/services/useAutomationService';
import { computed, inject, ref, watch } from 'vue';

const emit = defineEmits(['drawer', 'delete']);

const step = defineModel<AutomationStep>({
  required: true,
});
const menu = defineModel('menu', {
  default: false,
});
const {
  index,
  selected = false,
  automationId,
} = defineProps<{
  index?: number;
  selected?: boolean;
  automationId: string;
}>();

const triggers = inject<Ref<AutomationHandlerMetadata[]>>('triggers', ref([]));
const actions = inject<Ref<AutomationHandlerMetadata[]>>('actions', ref([]));
const { useValidateStep } = useAutomationService();

const isTrigger = computed(
  () => step.value.type === AutomationStepType.TRIGGER
);
const type = computed(() => step.value.type);
const value = computed(() => step.value.value);
const data = computed(() => step.value.data);

const { data: stepValidation } = useValidateStep({
  type,
  value,
  data,
  automationId,
});

const stepLabel = computed(() => {
  if (isTrigger.value) {
    if (!step.value.value || !triggers.value) {
      return 'Select a trigger';
    }

    const selectedOption = triggers.value.find(
      (trigger) => trigger.value === step.value.value
    );

    return selectedOption?.title || 'Unknown trigger';
  }

  if (!step.value.value || !actions.value) {
    return 'Select an action';
  }

  const selectedOption = actions.value.find(
    (t) => t.value === step.value.value
  );
  return selectedOption?.title || 'Unknown action';
});

const handleStepClicked = () => {
  if (step.value.value) {
    emit('drawer', step.value);
  } else {
    openSelectStepMenu();
  }
};

const openSelectStepMenu = () => {
  menu.value = true;
};

const handleStepValueChanged = (newValue: TriggerType | ActionType) => {
  menu.value = false;
  emit('drawer', step.value);

  step.value = {
    ...(step.value as AutomationStep),
    value: newValue,
  };
};

const handleDeleteStep = () => {
  emit('delete', index);
};

watch(
  () => step.value?.value,
  (v) => {
    if (v) handleStepValueChanged(v);
  }
);
</script>

<template>
  <v-card class="step overflow-visible user-select-none" width="100%">
    <v-menu v-model="menu" :close-on-content-click="false">
      <template #activator="{ props }">
        <v-card
          class="position-relative overflow-visible px-2"
          width="100%"
          border="thin"
          :color="'accent-lighten'"
          :class="{
            'border-opacity-75':
              selected || (stepValidation && !stepValidation?.isValid),
            'border-error': stepValidation && !stepValidation?.isValid,
          }"
          rounded="pill"
          @click="handleStepClicked"
        >
          <v-card-text class="d-flex align-center pa-2">
            <div class="flex-grow-1">
              <div>
                <v-btn
                  v-if="!isTrigger"
                  icon
                  color="default"
                  variant="text"
                  class="reorder-step-btn cursor-grab me-2"
                  size="small"
                  v-tooltip="'Drag to reorder'"
                >
                  <v-icon icon="mdi-cursor-move" />
                </v-btn>
                {{
                  !isTrigger
                    ? index !== undefined
                      ? ` ${index + 1}. `
                      : ''
                    : ''
                }}
                {{ stepLabel }}
              </div>
            </div>
            <v-btn
              v-bind="props"
              color="transparent"
              icon
              @click.stop="openSelectStepMenu"
              size="small"
            >
              <v-icon icon="mdi-chevron-down" size="20" />
            </v-btn>
          </v-card-text>

          <v-btn
            v-if="!isTrigger"
            icon
            :style="{
              position: 'absolute',
              right: '-64px',
              top: '50%',
              transform: 'translateY(-50%)',
            }"
            color="default"
            variant="tonal"
            @click.stop="handleDeleteStep"
            v-tooltip="'Delete step'"
          >
            <v-icon icon="mdi-delete-outline" />
          </v-btn>

          <v-icon
            v-if="stepValidation && !stepValidation.isValid"
            :style="{
              position: 'absolute',
              left: '-52px',
              top: '50%',
              transform: 'translateY(-50%)',
            }"
            icon="mdi-alert-circle"
            color="error"
            size="x-large"
            variant="tonal"
            v-tooltip="stepValidation.message"
          />
        </v-card>
      </template>

      <step-options-list v-if="step" v-model="step" />
    </v-menu>
  </v-card>
</template>
