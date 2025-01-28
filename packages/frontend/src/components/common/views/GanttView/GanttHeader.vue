<script setup lang="ts">
import type { TimelineHeader } from '@/composables/useGanttChart';

import GanttViewHeaderCell from './GanttViewHeaderCell.vue';
import { VSheet } from 'vuetify/components';

const { headers } = defineProps<{
  headers: TimelineHeader[];
}>();

const emit = defineEmits(['scroll']);

const weekHeaders = computed(() =>
  headers.filter((header) => header.type === 'week')
);

const dayHeaders = computed(() =>
  headers.filter((header) => header.type === 'day')
);

const handleScroll = (e: Event) => {
  emit('scroll', e);
};
</script>

<template>
  <v-sheet
    class="gantt-header position-sticky top-0 d-flex overflow-auto"
    @scroll="handleScroll"
  >
    <div class="border-b-thin">
      <v-sheet class="d-flex bg-accent-lighten border-b-thin">
        <template v-for="header in weekHeaders" :key="header.label">
          <gantt-view-header-cell :header />
        </template>
      </v-sheet>

      <v-sheet class="d-flex bg-accent-lighten">
        <template v-for="header in dayHeaders" :key="header.label">
          <gantt-view-header-cell :header class="text-color-subtitle" />
        </template>
      </v-sheet>
    </div>
  </v-sheet>
</template>
