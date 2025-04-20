<script setup lang="ts">
import type { AutomationHandlerMetadata } from '@tillywork/shared';

const {
  item,
  active = false,
  selected = false,
} = defineProps<{
  item: AutomationHandlerMetadata;
  active?: boolean;
  selected?: boolean;
}>();
</script>

<template>
  <v-list-item min-height="30" :active tabindex="-1">
    <template #prepend>
      <v-icon :icon="item.icon" />
    </template>
    <v-list-item-title>{{ item.title }}</v-list-item-title>
    <template #append v-if="selected">
      <v-icon icon="mdi-check" size="12" />
    </template>
  </v-list-item>
</template>
