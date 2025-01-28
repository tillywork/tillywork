<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

import type { Automation } from './types';

import { useAutomationService } from '@/services/useAutomationService';
import LocationSelector, {
  type LocationSelection,
} from '@/components/project-management/inputs/LocationSelector.vue';

const location = ref<LocationSelection>();
const listId = computed(() =>
  location.value?.locationType === 'list'
    ? location.value.location.id
    : undefined
);
const spaceId = computed(() =>
  location.value?.locationType === 'space'
    ? location.value.location.id
    : undefined
);

const { workspace } = storeToRefs(useAuthStore());

const { useGetAutomations } = useAutomationService();

const { data: automations, refetch } = useGetAutomations({
  workspaceId: workspace.value!.id,
  listId,
  spaceId,
});

function getAutomationCreatedByName(automation: Automation) {
  return automation.createdByType === 'system'
    ? 'System'
    : automation.createdBy?.firstName + ' ' + automation.createdBy?.lastName;
}

watch(location, () => {
  refetch();
});
</script>

<template>
  <v-container class="bg-surface" min-height="100vh">
    <h3>Automations</h3>

    <v-divider class="my-4" />

    <div class="mb-4 d-flex align-center">
      <span class="text-body-2 me-3 font-weight-bold">Location:</span>
      <location-selector v-model="location" width="150" />

      <v-spacer />
      <v-btn
        class="text-none text-body-3"
        rounded="pill"
        prepend-icon="mdi-plus"
        >Automate</v-btn
      >
    </div>

    <v-list lines="three" rounded="md" border="thin">
      <template v-for="automation in automations" :key="automation.id">
        <v-list-item @click="console.log(automation)" :ripple="false">
          <v-list-item-title class="text-h6 font-weight-medium">
            {{ automation.name }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-3">
            When
            <span>
              <u>{{ automation.triggerType.replace('_', ' ') }}</u>
            </span>
            then
            <span>
              <u>
                {{ automation.firstAction.type.replace('_', ' ') }}
              </u>
            </span>
          </v-list-item-subtitle>
          <template #append>
            <div class="d-flex flex-column align-end mt-n1">
              <v-switch
                :model-value="automation.isEnabled"
                inset
                hide-details
                density="comfortable"
                @click.stop
              />
              <span class="text-caption text-color-subtitle">
                <span class="font-weight-bold">Created by:</span>
                {{ getAutomationCreatedByName(automation) }}
              </span>
            </div>
          </template>
        </v-list-item>
      </template>

      <template v-if="!automations?.length">
        <div class="text-center d-flex flex-column my-4 ga-2">
          <h3 class="mb-4">Let's get started!</h3>
          <span class="text-body-2"
            >Create an automation to supercharge your workflows.</span
          >
          <span class="text-body-2 text-color-subtitle"
            >Automations allow you to automate actions in your workspace based
            on certain triggers.</span
          >
          <div class="text-center mt-2">
            <v-btn
              class="text-none text-body-3"
              rounded="pill"
              prepend-icon="mdi-plus"
              >Automate</v-btn
            >
          </div>
        </div>
      </template>
    </v-list>
  </v-container>
</template>
