<script setup lang="ts">
defineProps<{
  icon?: string;
  color?: string;
  rounded?: string;
  density?: string;
}>();
</script>

<template>
  <v-btn
    variant="text"
    :density="(density as any) ?? 'comfortable'"
    size="small"
    :icon="icon ?? 'mdi-plus'"
    :color="color ?? 'accent'"
    :rounded="rounded"
  />
</template>
