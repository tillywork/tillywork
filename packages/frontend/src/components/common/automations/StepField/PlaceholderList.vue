<script setup lang="ts">
import type { VList } from 'vuetify/components';

import PlaceholderListGroup from './PlaceholderListGroup.vue';

const { sampleData = {} } = defineProps<{
  sampleData?: Record<string, any>;
}>();

const emit = defineEmits(['select']);

const suggestionsList = ref<VList | null>(null);
const expandedGroups = ref();

function handleSelectPlaceholder(placeholderPath: string) {
  emit('select', placeholderPath);
}
</script>

<template>
  <v-card width="350" max-height="400" color="dialog" border="thin">
    <v-list
      class="pb-1"
      ref="suggestionsList"
      v-model:opened="expandedGroups"
      bg-color="transparent"
      open-strategy="multiple"
      nav
    >
      <template v-if="Object.keys(sampleData ?? {}).length > 0">
        <template v-for="(value, key) in sampleData" :key="key">
          <placeholder-list-group
            :value
            :group-key="key"
            @select="handleSelectPlaceholder"
          />
        </template>
      </template>
      <v-list-item v-else height="35" min-height="35">
        <template #prepend>
          <v-icon icon="mdi-information-outline" color="warning" />
        </template>
        <v-list-item-title class="text-caption font-medium-emphasis">
          No results found..
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style lang="scss" scoped>
.v-list-item {
  scroll-margin-top: 8px;
  scroll-margin-bottom: 8px;
}
</style>
