<script setup lang="ts">
import { useSettings } from '@/composables/useSettings';

import SettingsLayout from '@/layouts/SettingsLayout.vue';

const router = useRouter();

definePage({
  meta: {
    requiresAuth: true,
    hideNavigationDrawer: true,
  },
});

const { allSettings } = useSettings();

watchEffect(() => {
  if (allSettings) {
    router.push(`/settings/${allSettings[0].type}`);
  }
});
</script>

<template>
  <settings-layout />
</template>
