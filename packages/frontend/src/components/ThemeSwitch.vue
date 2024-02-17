<template>
  <v-switch
    v-model="selectedTheme"
    label="Dark Mode"
    color="primary"
    hide-details
    flat
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useTheme as useVuetifyTheme } from 'vuetify';

const { toggleTheme, theme } = useTheme();
const appTheme = useVuetifyTheme();

const selectedTheme = ref(theme === 'dark');

watch(selectedTheme, () => {
  toggleTheme();
  appTheme.global.name.value = selectedTheme.value ? 'dark' : 'light';
});
</script>
