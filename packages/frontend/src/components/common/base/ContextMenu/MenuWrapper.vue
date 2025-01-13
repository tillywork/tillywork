<script setup lang="ts">
import MenuItem from './MenuItem.vue';

import type { ContextMenuItem } from './types';
import { type Instance } from 'tippy.js';

const { items, tippy } = defineProps<{
  items: ContextMenuItem[];
  tippy?: Instance;
}>();
</script>

<template>
  <v-card min-width="200" border="thin" elevation="1">
    <v-list nav class="pa-1">
      <template v-for="item in items" :key="item.title">
        <menu-item :item :tippy />
      </template>
    </v-list>
  </v-card>
</template>
