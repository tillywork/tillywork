<script setup lang="ts">
import { useGanttCardResize } from '@/composables/useGanttCardResize';

import { useFieldQueryStore } from '@/stores/field.query';

import type { TimelineConfig } from '@/composables/useGanttChart';
import { type Card, dayjs } from '@tillywork/shared';
import { useGanttCardDrag } from '@/composables/useGanttCardDrag';
import type GanttChart from './GanttChart.vue';

const props = defineProps<{
  card: Card;
  chartWidth: number;
  columnWidth: number;
  rowHeight: number;
  timelineConfig: TimelineConfig;
}>();
const { chartWidth, timelineConfig } = toRefs(props);

const card = ref<Card>(props.card);
watchEffect(() => {
  card.value = props.card;
});

const ganttChart = inject<Ref<InstanceType<typeof GanttChart>> | null>(
  'ganttChart',
  null
);

const { titleField } = storeToRefs(useFieldQueryStore());

const position = computed(() => {
  if (!card.value.data.starts_at || !card.value.data.due_at) return null;

  if (card.value.data.due_at < card.value.data.starts_at) return null;

  const startDiff = dayjs(card.value.data.starts_at).diff(
    props.timelineConfig.startDate,
    'day'
  );
  const duration = dayjs(props.card.data.due_at).diff(
    props.card.data.starts_at,
    'day'
  );

  return {
    left: startDiff * props.columnWidth,
    width: (duration + 1) * props.columnWidth,
  };
});

const {
  startResize,
  isResizing,
  virtualPosition: resizePosition,
} = useGanttCardResize({
  ganttChart,
  timelineConfig,
  chartWidth,
  position,
  card,
});

const {
  startCardDrag,
  isDragging,
  virtualPosition: dragPosition,
} = useGanttCardDrag({
  ganttChart,
  timelineConfig,
  chartWidth,
  position,
  card,
});

const virtualPosition = computed(() => {
  if (isResizing.value) {
    return resizePosition.value;
  } else if (isDragging.value) {
    return dragPosition.value;
  } else {
    return position.value;
  }
});
</script>

<template>
  <v-hover #="{ props, isHovering }">
    <div
      v-bind="props"
      class="gantt-row d-flex align-center border-t-thin"
      :style="{
        height: `${rowHeight}px`,
        width: `${chartWidth}px`,
      }"
      :data-card-id="card.id"
    >
      &nbsp;
      <v-card
        v-if="virtualPosition"
        color="primary"
        variant="tonal"
        class="gantt-row-bar text-caption px-2 py-1 overflow-visible"
        rounded="pill"
        :style="{
          position: 'absolute',
          zIndex: 1,
          left: `${virtualPosition.left}px`,
          width: `${virtualPosition.width}px`,
          scrollMargin: '20px',
        }"
        @mousedown="startCardDrag"
      >
        <span class="d-block text-truncate" v-if="titleField">
          {{ card.data[titleField.slug] }}
        </span>

        <template v-if="isHovering">
          <div
            class="resizer resizer-right elevation-6"
            @mousedown.stop="startResize($event, card, 'right')"
          ></div>
          <div
            class="resizer resizer-left elevation-6"
            @mousedown.stop="startResize($event, card, 'left')"
          ></div>
        </template>
      </v-card>
    </div>
  </v-hover>
</template>

<style lang="scss" scoped>
.resizer {
  width: 4px;
  height: 15px;
  flex-grow: 0;
  max-height: 80%;
  background: rgba(var(--v-theme-surface-variant), 0.8);
  position: absolute;
  z-index: 1;
  border-radius: 6px;
}

.resizer-right {
  right: -5px;
  top: 50%;
  cursor: ew-resize;
  transform: translateY(-50%);
}

.resizer-left {
  left: -5px;
  top: 50%;
  cursor: ew-resize;
  transform: translateY(-50%);
}

.card-item {
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}
</style>
