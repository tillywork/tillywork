<script setup lang="ts">
defineProps<{
  isFilled?: boolean;
  label: string;
  icon: string;
  color?: string;
}>();
</script>

<template>
  <v-chip
    link
    rounded="xl"
    density="comfortable"
    :variant="isFilled ? 'tonal' : 'outlined'"
    :color="color ?? 'primary'"
  >
    <v-icon :icon="icon" size="14" start />
    <span class="text-caption user-select-none">
      {{ label }}
    </span>
    <slot />
    <template #append>
      <slot name="append" />
    </template>
  </v-chip>
</template>
