<script setup lang="ts">
import { ref, watch } from 'vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

const selectedTheme = ref(themeStore.theme === 'dark');
watch(selectedTheme, () => {
  themeStore.toggleTheme();
});
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
