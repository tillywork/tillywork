<script setup lang="ts">
import type { ContextMenuItem } from './types';
import { type Instance } from 'tippy.js';

const { item, tippy } = defineProps<{
  item: ContextMenuItem;
  tippy?: Instance;
}>();

function handleItemClick(item: ContextMenuItem) {
  item.action();

  if (tippy) {
    tippy.hide();
  }
}
</script>

<template>
  <v-list-item
    @click="handleItemClick(item)"
    height="30"
    class="py-0"
    min-height="30"
  >
    <div class="d-flex align-center ga-2">
      <v-icon :icon="item.icon" />
      <v-list-item-title>{{ item.title }}</v-list-item-title>
    </div>
    <template #append v-if="item.shortcut">
      <div class="d-flex align-center ga-1">
        <template v-for="(key, index) in item.shortcut" :key="index">
          <v-kbd class="text-xs elevation-0 bg-accent">
            {{ key }}
          </v-kbd>
        </template>
      </div>
    </template>
  </v-list-item>
</template>
