<script setup lang="ts">
import { NotificationChannel } from '@tillywork/shared';
import NotificationPreference from '../notifications/NotificationPreference.vue';
</script>

<template>
  <v-card>
    <h3>Notifications</h3>

    <p class="text-subtitle-2 mb-2 text-color-subtitle">
      Stay up-to-date with notifications.
    </p>

    <v-divider class="my-6" />

    <v-list nav lines="two">
      <NotificationPreference
        :channel="NotificationChannel.IN_APP"
        label="In-app"
      />
      <NotificationPreference
        :channel="NotificationChannel.SLACK"
        label="Slack"
      />
    </v-list>
  </v-card>
</template>
