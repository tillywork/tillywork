<script setup lang="ts">
import AutomationBuilder from '@/components/common/automations/AutomationBuilder.vue';
import { useAutomationService } from '@/services/useAutomationService';
import { useStateStore } from '@/stores/state';

const route = useRoute();
const { id } = route.params;

const { useGetAutomation } = useAutomationService();

const { data: automation } = useGetAutomation(id);

const { setTitle } = useStateStore();

watchEffect(() => {
  setTitle(automation.value?.name ?? 'Untitled');
});
</script>

<template>
  <div class="d-flex flex-column h-100">
    <automation-builder v-if="automation" :automation="automation" />
  </div>
</template>
