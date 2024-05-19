<script setup lang="ts">
import { ref, watch } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useTheme } from 'vuetify';

const themeStore = useThemeStore();

const selectedTheme = ref(themeStore.theme === 'dark');
watch(selectedTheme, () => {
  themeStore.toggleTheme();
});

/*
 * This handles setting the user's theme mode (dark or light)
 * across the application and setting it on Vuetify settings
 * when the application is opened and when the toggle is clicked.
 * Default: dark
 */
const appTheme = useTheme();
watch(
  () => themeStore.theme,
  (theme) => {
    appTheme.global.name.value = theme;
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <v-switch
    v-model="selectedTheme"
    label="Dark Mode"
    inset
    hide-details
    density="compact"
  />
</template>
