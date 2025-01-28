<script setup lang="ts">
import { useGanttDrag } from '@/composables/useGanttDrag';
import { useGanttScrollSync } from '@/composables/useGanttScrollSync';

import type {
  TimelineConfig,
  TimelineHeader,
} from '@/composables/useGanttChart';
import { type Card } from '@tillywork/shared';
import type { VSheet } from 'vuetify/components';

import GanttHeader from './GanttHeader.vue';
import GanttRow from './GanttRow.vue';
import GanttCardList from './GanttCardList.vue';
import GanttActions from './GanttActions.vue';

const props = defineProps<{
  chartWidth: number;
  headers: TimelineHeader[];
  todayPosition: number;
  allCards: Card[];
  columnWidth: number;
  rowHeight: number;
  timelineConfig: TimelineConfig;
}>();

const { allCards, chartWidth, timelineConfig, todayPosition, columnWidth } =
  toRefs(props);

const emit = defineEmits(['load']);

const ganttChart = ref<HTMLElement | null>(null);
const ganttCardList = ref<VSheet | null>(null);
const ganttHeader = ref<VSheet | null>(null);

const { startDragging, drag, stopDragging } = useGanttDrag(
  ganttChart,
  allCards,
  timelineConfig,
  columnWidth
);

const { scrollToToday, handleXYScroll, handleXScroll, handleYScroll } =
  useGanttScrollSync({
    todayPosition,
    ganttChart,
    ganttHeader,
    ganttCardList,
  });

const scrollToCard = (id: string) => {
  const cardBar = document.querySelector(
    `[data-card-id="${id}"] .gantt-row-bar`
  ) as HTMLElement | null;

  if (cardBar) {
    cardBar.scrollIntoView({
      behavior: 'smooth',
    });
  }
};

onMounted(() => {
  nextTick(() => {
    scrollToToday();
  });
});

defineExpose({
  el: ganttChart,
  scrollToToday,
  scrollToCard,
});
</script>

<template>
  <div class="gantt-container d-flex flex-column h-100">
    <div class="gantt-headers d-flex">
      <gantt-actions />
      <gantt-header
        ref="ganttHeader"
        :width="chartWidth"
        :headers="headers"
        @scroll="handleXScroll"
      />
    </div>

    <div class="gantt-scrollable-content d-flex flex-grow-1 overflow-hidden">
      <gantt-card-list
        ref="ganttCardList"
        :allCards="allCards"
        :rowHeight="rowHeight"
        @scroll="handleYScroll"
        @load="(params) => emit('load', params)"
      />

      <div
        ref="ganttChart"
        class="gantt-chart overflow-auto"
        :style="{ width: `${chartWidth}px` }"
        @mousedown="startDragging"
        @mousemove="drag"
        @mouseup="stopDragging"
        @mouseleave="stopDragging"
        @scroll="handleXYScroll"
      >
        <v-sheet class="gantt-rows pt-8 position-relative" v-memo="allCards">
          <div
            class="today-indicator border-s-lg border-primary"
            :style="{
              position: 'absolute',
              top: '0',
              bottom: '0',
              left: `${todayPosition}px`,
            }"
          >
            <v-chip
              class="text-caption"
              rounded="0"
              density="compact"
              color="primary"
              variant="tonal"
              >Today</v-chip
            >
          </div>
          <template v-for="card in allCards" :key="card.id">
            <gantt-row
              :card="card"
              :chartWidth="chartWidth"
              :columnWidth="columnWidth"
              :rowHeight="rowHeight"
              :timelineConfig="timelineConfig"
            />
          </template>
        </v-sheet>
      </div>
    </div>
  </div>
</template>
