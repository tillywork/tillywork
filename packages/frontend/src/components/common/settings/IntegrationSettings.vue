<script setup lang="ts">
import SlackIntegration from '../integrations/SlackIntegration.vue';
</script>

<template>
  <v-card>
    <h3>Integrations</h3>

    <p class="text-subtitle-2 mb-2 text-color-subtitle">
      Manage your integrations to enhance your workspace's capabilities.
    </p>

    <v-divider class="my-6" />

    <v-list nav lines="two">
      <slack-integration />
    </v-list>
  </v-card>
</template>
