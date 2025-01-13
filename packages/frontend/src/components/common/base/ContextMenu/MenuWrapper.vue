<script setup lang="ts">
import MenuItem from './MenuItem.vue';

import type { ContextMenuItem } from './types';

const { items } = defineProps<{
  items: ContextMenuItem[];
}>();
</script>

<template>
  <v-card min-width="200" border="thin">
    <v-list nav class="pa-1">
      <template v-for="item in items" :key="item.title">
        <menu-item :item />
      </template>
    </v-list>
  </v-card>
</template>
