<script setup lang="ts">
import type { ContextMenuItem } from './types';

const { item } = defineProps<{
  item: ContextMenuItem;
}>();
</script>

<template>
  <v-list-item @click="item.onClick()" height="30" class="py-0" min-height="30">
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
