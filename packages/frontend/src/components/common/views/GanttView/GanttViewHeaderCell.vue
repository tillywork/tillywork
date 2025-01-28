<script setup lang="ts">
import type { TimelineHeader } from '@/composables/useGanttChart';

const { header } = defineProps<{
  header: TimelineHeader;
}>();
</script>

<template>
  <div
    class="text-caption px-2 py-1 border-s-thin d-flex align-center flex-shrink-0"
    :style="{
      width: `${header.width}px`,
    }"
  >
    {{ header.label }}
    <v-spacer />
    <span class="text-color-subtitle" v-if="header.appendLabel">
      {{ header.appendLabel }}
    </span>
  </div>
</template>
