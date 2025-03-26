import { useAutomationService } from '@/services/useAutomationService';
import {
  TriggerType,
  type AutomationStep,
  type Automation,
  AutomationStepType,
  ActionType,
} from '@tillywork/shared';
import { cloneDeep, isEqual } from 'lodash';

export const useAutomation = (initialAutomation: Automation) => {
  const { useGetAutomation, getHandlerSampleData } = useAutomationService();
  const { data: automationCopy } = useGetAutomation(initialAutomation.id);

  const automation = ref(cloneDeep(automationCopy.value ?? initialAutomation));

  watch(
    automationCopy,
    (v) => {
      if (v) {
        automation.value = cloneDeep(v);
      }
    },
    { deep: true }
  );

  const isAutomationChanged = computed(
    () => !isEqual(automation.value, automationCopy.value ?? initialAutomation)
  );

  const updateTrigger = (value: TriggerType) => {
    automation.value = {
      ...automation.value,
      trigger: {
        ...automation.value.trigger,
        value,
      },
    };
  };

  const addStep = (index?: number) => {
    const emptyStep = {
      type: AutomationStepType.ACTION,
      data: {},
    } as AutomationStep;

    let newSteps: AutomationStep[] = [];
    const currentSteps = automation.value.steps;

    if (index) {
      newSteps = [
        ...currentSteps.slice(0, index),
        emptyStep,
        ...currentSteps.slice(index),
      ];
    } else {
      newSteps = [...currentSteps, emptyStep];
    }

    automation.value = {
      ...automation.value,
      steps: newSteps,
    };
  };

  const removeStep = (index: number) => {
    let newSteps: AutomationStep[] = [];
    const currentSteps = automation.value.steps;

    newSteps = [
      ...currentSteps.slice(0, index),
      ...currentSteps.slice(index + 1),
    ];

    automation.value = {
      ...automation.value,
      steps: newSteps,
    };
  };

  const getPlaceholders = async () => {
    const placeholders: Record<string, any> = {};

    if (automationCopy.value?.trigger?.value) {
      const triggerHandler = automationCopy.value.trigger.value;

      placeholders['trigger'] = await getHandlerSampleData({
        automationId: automationCopy.value.id,
        handler: triggerHandler,
      });
    }

    if (automationCopy.value?.steps) {
      for (const [index, step] of automationCopy.value.steps.entries()) {
        placeholders[`step_${index + 1}`] = await getHandlerSampleData({
          automationId: automationCopy.value.id,
          handler: step.value as ActionType,
        });
      }
    }

    return placeholders;
  };

  const placeholders = ref<Record<string, any>>();

  watchEffect(async () => {
    if (automationCopy.value?.trigger.value || automationCopy.value?.steps) {
      placeholders.value = await getPlaceholders();
    }
  });

  return {
    automation,
    isAutomationChanged,
    updateTrigger,
    addStep,
    removeStep,
    getPlaceholders,
    placeholders,
  };
};
