<script setup lang="ts">
import { useAutomationService } from '@/services/useAutomationService';

import { useSnackbarStore } from '@/stores/snackbar';

import type { Automation } from '@tillywork/shared';

import LocationSelector from '../inputs/LocationSelector.vue';
import BaseEditorInput from '../inputs/BaseEditor/BaseEditorInput.vue';

const emit = defineEmits(['close']);

const automation = defineModel<Automation>({
  required: true,
});

const { isAutomationChanged = false } = defineProps<{
  isAutomationChanged?: boolean;
}>();

const { showSnackbar } = useSnackbarStore();

const { useUpdateAutomation } = useAutomationService();
const { mutateAsync: updateAutomation, isPending: isUpdating } =
  useUpdateAutomation();

const handleUpdateAutomation = () => {
  updateAutomation(automation.value).then(() => {
    showSnackbar({
      message: 'Automation saved.',
      color: 'success',
    });
  });
};
</script>

<template>
  <v-app-bar
    class="automation-builder-header border-b-thin px-4 d-flex align-center"
    color="surface"
    height="60"
  >
    <v-btn
      class="text-caption me-2"
      variant="text"
      density="compact"
      @click="emit('close')"
      icon
    >
      <v-icon icon="mdi-chevron-left" />
    </v-btn>
    <base-editor-input
      class="border-none font-weight-bold"
      v-model:text="automation.name"
      :heading="3"
      single-line
      disable-commands
      hide-attachment-button
    />

    <v-spacer />
    <div class="d-flex align-center ga-6">
      <location-selector v-model="automation.locations" multiple />
      <v-icon
        icon="mdi-circle"
        :color="isAutomationChanged ? 'warning' : 'success'"
        size="14"
        v-tooltip="isAutomationChanged ? 'Changes were made' : 'Saved'"
      />
      <v-switch
        v-model="automation.isEnabled"
        density="compact"
        inset
        hide-details
        v-tooltip="
          `Automation is ${automation.isEnabled ? 'enabled' : 'disabled'}`
        "
      />
      <v-btn
        @click="handleUpdateAutomation"
        class="text-caption"
        variant="flat"
        color="primary"
        density="comfortable"
        :loading="isUpdating"
        :disabled="!isAutomationChanged"
        >Save</v-btn
      >
    </div>
  </v-app-bar>
</template>
