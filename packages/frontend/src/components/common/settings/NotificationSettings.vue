<script setup lang="ts">
import { useIntegrations } from '@/composables/useIntegrations';

import { IntegrationType, NotificationChannel } from '@tillywork/shared';

import NotificationPreference from '../notifications/NotificationPreference.vue';

export type ChannelConfig = {
  channel: NotificationChannel;
  title: string;
  ripple?: boolean;
  hideSwitch?: boolean;
  onClick?: () => void;
};

const router = useRouter();

const { isIntegrationEnabled } = useIntegrations();

const preferences = computed<ChannelConfig[]>(() => {
  const channels: ChannelConfig[] = [
    {
      channel: NotificationChannel.IN_APP,
      title: 'In-app',
      ripple: false,
    },
  ];

  if (isIntegrationEnabled(IntegrationType.SLACK)) {
    channels.push({
      channel: NotificationChannel.SLACK,
      title: 'Slack',
      onClick: () => goToConfig(NotificationChannel.SLACK),
      hideSwitch: true,
    });
  }

  return channels;
});

function goToConfig(channel: NotificationChannel) {
  router.push(`/settings/notifications/${channel}`);
}
</script>

<template>
  <v-card>
    <h3>Notifications</h3>

    <p class="text-subtitle-2 mb-2 text-color-subtitle">
      Stay up-to-date with notifications.
    </p>

    <v-divider class="my-6" />

    <v-list nav lines="two">
      <template v-for="preference in preferences" :key="preference.channel">
        <NotificationPreference
          v-bind="preference"
          @click="preference.onClick"
        />
      </template>
    </v-list>
  </v-card>
</template>
