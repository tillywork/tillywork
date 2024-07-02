<script setup lang="ts">
const slots = defineSlots();
</script>

<template>
  <v-btn variant="text" color="default" size="small">
    <template #prepend v-if="slots.prepend">
      <slot name="prepend" />
    </template>
    <slot />
    <template #append v-if="slots.append">
      <slot name="append" />
    </template>
  </v-btn>
</template>
