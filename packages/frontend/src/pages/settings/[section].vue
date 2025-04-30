<script setup lang="ts">
import { useSettings } from '@/composables/useSettings';
import { useStateStore } from '@/stores/state';
import SettingsLayout from '@/layouts/SettingsLayout.vue';

definePage({
  meta: {
    requiresAuth: true,
    hideNavigationDrawer: true,
  },
});

const route = useRoute('/settings/[section]');
const { allSettings } = useSettings();

const { setTitle } = useStateStore();

const activeSection = computed(() => {
  return allSettings.find((setting) => setting.type === route.params.section);
});

watchEffect(() => {
  if (activeSection.value) {
    setTitle(activeSection.value.title);
  }
});
</script>

<template>
  <settings-layout>
    <component v-if="activeSection" :is="activeSection.component" />
  </settings-layout>
</template>
