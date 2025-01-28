<script setup lang="ts">
import GanttChart from './GanttChart.vue';

const ganttChart = inject<Ref<InstanceType<typeof GanttChart>> | null>(
  'ganttChart'
);

const scrollToToday = () => {
  if (ganttChart?.value) {
    ganttChart.value.scrollToToday();
  }
};
</script>

<template>
  <v-sheet
    class="pa-2 d-flex flex-shrink-0 align-center justify-end flex-wrap border-e-thin"
    width="300"
    height="58"
  >
    <v-btn
      class="px-1"
      color="primary"
      density="comfortable"
      variant="tonal"
      rounded="md"
      @click="scrollToToday"
      v-shortcut="'t'"
    >
      <span class="text-caption"> Today </span>
    </v-btn>
  </v-sheet>
</template>
