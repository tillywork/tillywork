<script setup lang="ts">
defineProps<{
  icon?: string;
  color?: string;
  rounded?: string;
  density?: string;
  variant?: 'flat' | 'text';
  size?: 'small' | 'x-small' | 'default';
}>();
</script>

<template>
  <v-btn
    class="base-icon-btn"
    :variant="variant ?? 'text'"
    :density="(density as any) ?? 'comfortable'"
    :size="size ?? 'small'"
    icon
    :color="color ?? 'default'"
    :rounded="rounded"
  >
    <v-icon :size="size ?? 'small'" :icon="icon ?? 'mdi-plus'" />
  </v-btn>
</template>
