<script setup lang="ts">
const slots = defineSlots();
</script>

<template>
  <v-btn variant="text" color="default" size="small">
    <template #prepend v-if="slots.prepend">
      <slot name="prepend" />
    </template>
    <slot />
  </v-btn>
</template>
