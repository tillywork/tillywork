<script setup lang="ts">
import type { MaybeRef } from 'vue';
import MenuItem from './MenuItem.vue';

import type { ContextMenuItem } from './types';
import { type Instance } from 'tippy.js';

const selectedItems = defineModel<unknown | unknown[] | null>({
  default: null,
});

const { items, tippy, onUpdateModelValue } = defineProps<{
  items: MaybeRef<ContextMenuItem[]>;
  tippy?: Instance;
  selectable?: boolean;
  multiple?: boolean;
  onUpdateModelValue?: (v: unknown | unknown[]) => void;
}>();

const toValueLocal = toValue;

watch(selectedItems, (v) => onUpdateModelValue?.(v));
</script>

<template>
  <v-card min-width="200" border="thin" elevation="1" color="dialog">
    <v-list nav class="pa-1" bg-color="transparent">
      <template v-for="item in toValueLocal(items)" :key="item.title">
        <menu-item
          v-model="selectedItems"
          :item="item"
          :tippy
          :selectable
          :multiple
        />
      </template>
    </v-list>
  </v-card>
</template>
