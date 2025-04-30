<script setup lang="ts">
import { NotificationChannel } from '@tillywork/shared';

import SettingsLayout from '@/layouts/SettingsLayout.vue';

definePage({
  meta: {
    requiresAuth: true,
    hideNavigationDrawer: true,
  },
});

const route = useRoute('/settings/notifications/[channel]');

const channel = computed(() => route.params.channel as NotificationChannel);

const channelComponent = computed(() => {
  switch (channel.value) {
    case NotificationChannel.SLACK:
      return defineAsyncComponent(
        () =>
          import(
            '@/components/common/notifications/NotificationSettingsSlack.vue'
          )
      );

    default:
      return null;
  }
});
</script>

<template>
  <settings-layout>
    <component v-if="channelComponent" :is="channelComponent" />
  </settings-layout>
</template>
