<script setup lang="ts">
import { useAutomationService } from '@/composables/services/useAutomationService';
import { useAuthStore } from '@/stores/auth';
import type { Automation } from './types';
import LocationSelector, {
  type LocationSelection,
} from '@/components/project-management/inputs/LocationSelector.vue';

const location = ref<LocationSelection>();

const { workspace } = storeToRefs(useAuthStore());

const { useGetAutomations } = useAutomationService();

const { data: automations } = useGetAutomations({
  workspaceId: workspace.value!.id,
});

function getAutomationCreatedByName(automation: Automation) {
  return automation.createdByType === 'system'
    ? 'System'
    : automation.createdBy?.firstName + ' ' + automation.createdBy?.lastName;
}
</script>

<template>
  <v-container>
    <h3>Automations</h3>

    <v-divider class="my-4" />

    <div class="mb-4">
      <span class="text-body-2 me-3 font-weight-bold">Location:</span>
      <location-selector v-model="location" width="150" />
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
    </v-list>
  </v-container>
</template>
