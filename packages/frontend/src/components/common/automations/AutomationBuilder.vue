<script setup lang="ts">
import { useAutomation } from '@/composables/useAutomation';

import { useAutomationService } from '@/services/useAutomationService';

import {
  type AutomationStep,
  type Automation,
  AutomationStepType,
} from '@tillywork/shared';

import { useDialogStore } from '@/stores/dialog';

import { DIALOGS } from '../dialogs/types';

import AutomationBuilderHeader from './AutomationBuilderHeader.vue';
import StepSideDrawer from './StepSideDrawer.vue';
import Step from './Step.vue';
import draggable from 'vuedraggable';
import { cloneDeep } from 'lodash';

const { automation } = defineProps<{
  automation: Automation;
}>();
const emit = defineEmits(['close']);

export type StepComponentType = InstanceType<typeof Step>;

const isSideDrawerOpen = ref(false);
const selectedStep = ref<AutomationStep | null>(null);
const selectedStepIndex = ref<number | null>(null);

const { openDialog } = useDialogStore();
const { useGetActions, useGetTriggers } = useAutomationService();

const {
  isAutomationChanged,
  automation: reactiveAutomation,
  addStep,
  removeStep,
  placeholders,
} = useAutomation(automation);

const { data: actions } = useGetActions();
const { data: triggers } = useGetTriggers();

provide('actions', actions);
provide('triggers', triggers);
provide('placeholders', placeholders);
provide('automation', reactiveAutomation);

const handleDrawerEvent = (
  step: AutomationStep,
  index: number | null = null
) => {
  isSideDrawerOpen.value = true;
  selectedStep.value = cloneDeep(step);
  selectedStepIndex.value = index;
};

const handleRemoveStep = (index: number) => {
  openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Remove step',
      message: 'Are you sure you want to remove this step?',
      onConfirm: () => {
        removeStep(index);
      },
    },
  });
};

function isStepSelected(step: AutomationStep, index: number | null = null) {
  if (step.type === AutomationStepType.TRIGGER) {
    return selectedStep.value?.type === AutomationStepType.TRIGGER;
  } else {
    return selectedStepIndex.value === index;
  }
}

watch(isSideDrawerOpen, (v) => {
  if (!v) {
    selectedStep.value = null;
  }
});

watch(
  selectedStep,
  (newStep) => {
    if (!newStep || !isSideDrawerOpen.value) return;

    if (newStep.type === AutomationStepType.TRIGGER) {
      reactiveAutomation.value = {
        ...reactiveAutomation.value,
        trigger: newStep,
      };
    } else {
      const index = selectedStepIndex.value ?? -1;
      if (index >= 0) {
        reactiveAutomation.value = {
          ...reactiveAutomation.value,
          steps: [
            ...reactiveAutomation.value.steps.slice(0, index),
            newStep,
            ...reactiveAutomation.value.steps.slice(index + 1),
          ],
        };
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <v-card>
    <automation-builder-header
      v-model="reactiveAutomation"
      :isAutomationChanged
      @close="emit('close')"
    />
    <v-card
      class="automation-builder-canvas d-flex align-center flex-column ga-2 pt-12"
    >
      <div
        class="trigger-step step-wrapper ga-4 mb-12"
        v-if="reactiveAutomation.trigger"
      >
        <p class="font-weight-bold align-self-start mb-2 text-h6">
          When this happens..
        </p>
        <step
          v-model="reactiveAutomation.trigger"
          :selected="isStepSelected(reactiveAutomation.trigger)"
          @drawer="handleDrawerEvent"
        />
      </div>
      <div class="step-wrapper ga-4">
        <p class="font-weight-bold align-self-start mb-2 text-h6">
          Then do this..
        </p>
        <draggable
          :list="reactiveAutomation.steps"
          item-key="id"
          class="w-100"
          :delay="300"
          :delay-on-touch-only="true"
          :touch-start-threshold="5"
          handle=".reorder-step-btn"
        >
          <template #item="{ element, index }">
            <step
              v-model="reactiveAutomation.steps[index]"
              class="mb-4"
              :index
              :selected="isStepSelected(element, index)"
              @drawer="(step) => handleDrawerEvent(step, index)"
              @delete="handleRemoveStep(index)"
            />
          </template>
        </draggable>
      </div>
      <div class="step-wrapper">
        <v-btn
          class="mt-6"
          icon
          variant="outlined"
          density="comfortable"
          v-tooltip="'Add a step'"
          @click="addStep()"
        >
          <v-icon icon="mdi-plus" size="large" />
        </v-btn>
      </div>
    </v-card>

    <step-side-drawer
      :key="selectedStep?.id ?? selectedStepIndex ?? 'trigger'"
      v-model="selectedStep"
      v-model:open="isSideDrawerOpen"
      :automation="reactiveAutomation"
    />
  </v-card>
</template>

<style lang="scss" scoped>
.automation-builder-canvas {
  position: relative;
  min-height: 400px;
}

.step-wrapper {
  position: relative;
  width: 600px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}
</style>
