<script setup lang="ts">
import type { SettingsNavigationItem } from '@/composables/useSettings';

const { title, settings } = defineProps<{
  title: string;
  settings: SettingsNavigationItem[];
}>();
</script>

<template>
  <v-list-subheader>{{ title }}</v-list-subheader>
  <v-list-item
    v-for="section in settings"
    :key="section.type"
    :to="'/settings/' + section.type"
    rounded="md"
    slim
  >
    <template #prepend>
      <v-icon>{{ section.icon }}</v-icon>
    </template>
    <v-list-item-title>
      {{ section.title }}
    </v-list-item-title>
  </v-list-item>
</template>
