<script setup lang="ts">
import type { SettingsNavigationItem } from '@/composables/useSettings';

const { title, settings } = defineProps<{
  title: string;
  settings: SettingsNavigationItem[];
}>();

const route = useRoute();

const isActive = (sectionType: string) => {
  return sectionType && route.path.startsWith(`/settings/${sectionType}`);
};
</script>

<template>
  <v-list-subheader>{{ title }}</v-list-subheader>
  <v-list-item
    v-for="section in settings"
    :key="section.type"
    :to="'/settings/' + section.type"
    rounded="md"
    slim
    :active="isActive(section.type)"
  >
    <template #prepend>
      <v-icon>{{ section.icon }}</v-icon>
    </template>
    <v-list-item-title>
      {{ section.title }}
    </v-list-item-title>
  </v-list-item>
</template>
