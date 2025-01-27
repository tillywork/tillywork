<script setup lang="ts">
import {
  type TimelineConfig,
  useGanttChart,
} from '@/composables/useGanttChart';
import {
  type Card,
  type List,
  type ListGroup,
  type QueryFilter,
  type View,
  type ViewFilter,
  dayjs,
} from '@tillywork/shared';
import GanttViewHeaderCell from './GanttViewHeaderCell.vue';

import { useCardsService, type CardsData } from '@/services/useCardsService';
import type { VSheet } from 'vuetify/components';
import { cloneDeep } from 'lodash';
import { useCard } from '@/composables/useCard';
import { useFieldQueryStore } from '@/stores/field.query';

const { list, view, groups } = defineProps<{
  list: List;
  view: View;
  groups: ListGroup[];
}>();

const reactiveGroups = ref<ListGroup[]>(groups);
watch(
  () => groups,
  (v) => (reactiveGroups.value = v)
);

const filters = computed<QueryFilter>(() => {
  const viewFilters = {
    where: {
      and: [
        ...(cloneDeep((view.filters as ViewFilter).where.quick?.and) ?? []),
        ...(cloneDeep((view.filters as ViewFilter).where.advanced?.and) ?? []),
      ],
    },
  };

  return viewFilters;
});

watch(
  () => view,
  () => refetch(),
  { deep: true }
);

const { fields } = storeToRefs(useFieldQueryStore());
const { normalizeFieldValue, updateCard } = useCard();

const dueAtField = computed(() =>
  fields.value?.find((f) => f.slug === 'due_at')
);
const startsAtField = computed(() =>
  fields.value?.find((f) => f.slug === 'starts_at')
);

const { useGetGroupCardsInfinite } = useCardsService();
const { data: cardPages, refetch } = useGetGroupCardsInfinite({
  listId: list.id,
  groupId: groups[0]?.id,
  hideCompleted: computed(() => view.options.hideCompleted ?? false),
  hideChildren: computed(() => view.options.hideChildren ?? false),
  filters,
  sortBy: computed(() => (view.options.sortBy ? [view.options.sortBy] : [])),
});

const allCards = computed(() => {
  const cards: Card[] = [];
  cardPages.value?.pages.forEach((page: CardsData) => {
    cards.push(...page.cards);
  });
  return cards;
});

const rowHeight = computed(() => 40);

const timelineConfig = ref<TimelineConfig>({
  startDate: dayjs().subtract(1, 'month'),
  endDate: dayjs().add(1, 'month'),
});

const { chartWidth, todayPosition, headers, getCardPosition } = useGanttChart({
  list,
  view,
  timelineConfig,
});

const weekHeaders = computed(() =>
  headers.value.filter((header) => header.type === 'week')
);

const dayHeaders = computed(() =>
  headers.value.filter((header) => header.type === 'day')
);
const ganttChart = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

/** In pixels, defines
 *  how much should the user move the mouse
 *  for this to be counted as a drag,
 *  not a normal click.
 */
const DRAG_THRESHOLD = 5;
let initialMouseX = 0;
let initialMouseY = 0;

const startDragging = (e: MouseEvent) => {
  if (!ganttChart.value) return;

  isDragging.value = true;
  const el = ganttChart.value;

  startX.value = e.pageX - el.offsetLeft;
  scrollLeft.value = el.scrollLeft;

  initialMouseX = e.clientX;
  initialMouseY = e.clientY;

  el.style.cursor = 'grabbing';
};

const stopDragging = (e: MouseEvent) => {
  if (!ganttChart.value) return;

  const deltaX = Math.abs(e.clientX - initialMouseX);
  const deltaY = Math.abs(e.clientY - initialMouseY);

  isDragging.value = false;
  ganttChart.value.style.cursor = 'grab';

  if (deltaX < DRAG_THRESHOLD && deltaY < DRAG_THRESHOLD) {
    // Find the card associated with the clicked row
    const clickedRow = e.target as HTMLElement;
    const cardId = clickedRow.getAttribute('data-card-id');
    if (!cardId) return;

    const card = allCards.value.find((c) => c.id === +cardId);

    if (card) {
      handleRowClick(e, card);
    }
  }
};

const drag = (e: MouseEvent) => {
  if (!isDragging.value || !ganttChart.value) return;

  e.preventDefault();
  const el = ganttChart.value;

  const x = e.pageX - el.offsetLeft;

  const walkX = x - startX.value;
  el.scrollLeft = scrollLeft.value - walkX;

  // Reverse Y-axis movement
  el.scrollTop -= e.movementY;
};

const handleRowClick = async (event: MouseEvent, card: Card) => {
  if (!ganttChart.value || getCardPosition(card)) return;

  const rect = ganttChart.value.getBoundingClientRect();
  const scrollLeft = ganttChart.value.scrollLeft;
  const clickX = event.clientX - rect.left + scrollLeft;

  const totalDays = timelineConfig.value.endDate.diff(
    timelineConfig.value.startDate,
    'day'
  );
  const daysOffset = Math.ceil((clickX / chartWidth.value) * totalDays);
  const clickedDate = timelineConfig.value.startDate.add(daysOffset, 'day');

  const startsAt = clickedDate.set('hour', 0).toISOString();
  const dueAt = clickedDate.set('hour', 23).toISOString();

  if (startsAtField.value && dueAtField.value) {
    const cardCopy = {
      id: card.id,
      data: {
        ...card.data,
        [startsAtField.value.slug]: normalizeFieldValue({
          v: startsAt,
          field: startsAtField.value,
        }),
        [dueAtField.value.slug]: normalizeFieldValue({
          v: dueAt,
          field: dueAtField.value,
        }),
      },
    };

    await updateCard(cardCopy as Card);
  }
};

const resizingCard = ref<Card | null>(null);
const resizingEdge = ref<'left' | 'right' | null>(null);
const initialX = ref(0);
const initialScrollLeft = ref(0);
const tempPosition = ref<{
  left: number;
  width: number;
  edge: 'left' | 'right' | null;
}>({ left: 0, width: 0, edge: null });
const initialDates = ref<{
  startsAt: dayjs.Dayjs;
  dueAt: dayjs.Dayjs;
}>();
const initialCardMetrics = ref<{
  left: number;
  width: number;
}>();

const startResize = (e: MouseEvent, card: Card, edge: 'left' | 'right') => {
  e.stopPropagation();
  if (!ganttChart.value) return;

  // Store initial values
  const position = getCardPosition(card);
  if (!position) return;

  resizingCard.value = card;
  resizingEdge.value = edge;
  initialX.value = e.clientX;
  initialScrollLeft.value = ganttChart.value.scrollLeft;

  // Store initial dates and metrics
  initialDates.value = {
    startsAt: dayjs(card.data.starts_at),
    dueAt: dayjs(card.data.due_at),
  };
  initialCardMetrics.value = {
    left: position.left,
    width: position.width,
  };

  // Initialize temporary position
  tempPosition.value = {
    left: position.left,
    width: position.width,
    edge: edge,
  };

  document.body.style.userSelect = 'none';
  window.addEventListener('mousemove', handleResize);
  window.addEventListener('mouseup', stopResize);
};

const handleResize = (e: MouseEvent) => {
  if (!resizingCard.value || !ganttChart.value || !initialCardMetrics.value)
    return;

  // Calculate deltaX with scroll adjustment
  const deltaX =
    e.clientX -
    initialX.value +
    (initialScrollLeft.value - ganttChart.value.scrollLeft);

  // Update temporary position based on edge
  if (resizingEdge.value === 'left') {
    tempPosition.value = {
      left: initialCardMetrics.value.left + deltaX,
      width: initialCardMetrics.value.width - deltaX,
      edge: 'left',
    };
  } else if (resizingEdge.value === 'right') {
    tempPosition.value = {
      left: initialCardMetrics.value.left,
      width: initialCardMetrics.value.width + deltaX,
      edge: 'right',
    };
  }
};

const stopResize = async () => {
  if (!resizingCard.value || !initialDates.value) return;

  // Calculate final dates based on temp position
  const totalDays = timelineConfig.value.endDate.diff(
    timelineConfig.value.startDate,
    'day'
  );
  const dayWidth = chartWidth.value / totalDays;
  const deltaDays = Math.round(
    (resizingEdge.value === 'left'
      ? tempPosition.value.left - initialCardMetrics.value!.left
      : tempPosition.value.width - initialCardMetrics.value!.width) / dayWidth
  );

  try {
    let newStartsAt = initialDates.value.startsAt;
    let newDueAt = initialDates.value.dueAt;

    if (resizingEdge.value === 'left') {
      newStartsAt = initialDates.value.startsAt.add(deltaDays, 'day');
    } else {
      newDueAt = initialDates.value.dueAt.add(deltaDays, 'day');
    }

    // Update card with final dates
    const updates: Partial<Card['data']> = {};
    if (startsAtField.value && resizingEdge.value === 'left') {
      updates[startsAtField.value.slug] = normalizeFieldValue({
        v: newStartsAt.startOf('day').toISOString(),
        field: startsAtField.value,
      });
    }
    if (dueAtField.value && resizingEdge.value === 'right') {
      updates[dueAtField.value.slug] = normalizeFieldValue({
        v: newDueAt.endOf('day').toISOString(),
        field: dueAtField.value,
      });
    }

    await updateCard({
      id: resizingCard.value.id,
      data: { ...resizingCard.value.data, ...updates },
    } as Card);
  } finally {
    // Reset state
    document.body.style.userSelect = '';
    resizingCard.value = null;
    resizingEdge.value = null;
    tempPosition.value = { left: 0, width: 0, edge: null };
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
  }
};

const draggingCard = ref<Card | null>(null);
const initialDragPosition = ref({
  x: 0,
  scrollLeft: 0,
  startLeft: 0,
  startsAt: dayjs(),
  dueAt: dayjs(),
});

const startCardDrag = (e: MouseEvent, card: Card) => {
  e.stopPropagation();
  if (!ganttChart.value) return;

  const position = getCardPosition(card);
  if (!position) return;

  draggingCard.value = card;

  // Store initial positions with scroll consideration
  initialDragPosition.value = {
    x: e.clientX,
    scrollLeft: ganttChart.value.scrollLeft,
    startLeft: position.left,
    startsAt: dayjs(card.data.starts_at),
    dueAt: dayjs(card.data.due_at),
  };

  // Initialize temporary position
  tempPosition.value = {
    left: position.left,
    width: position.width,
    edge: null,
  };

  document.body.style.userSelect = 'none';
  window.addEventListener('mousemove', handleCardDrag);
  window.addEventListener('mouseup', stopCardDrag);
};

const handleCardDrag = (e: MouseEvent) => {
  if (!draggingCard.value || !ganttChart.value) return;

  // Calculate deltaX with scroll compensation
  const deltaX =
    e.clientX -
    initialDragPosition.value.x +
    (initialDragPosition.value.scrollLeft - ganttChart.value.scrollLeft);

  // Convert pixels to days
  const totalDays = timelineConfig.value.endDate.diff(
    timelineConfig.value.startDate,
    'day'
  );
  const dayWidth = chartWidth.value / totalDays;
  const deltaDays = Math.round(deltaX / dayWidth);

  // Calculate new positions
  const newLeft = initialDragPosition.value.startLeft + deltaDays * dayWidth;
  const durationDays = initialDragPosition.value.dueAt.diff(
    initialDragPosition.value.startsAt,
    'day'
  );

  // Update visual position
  tempPosition.value = {
    left: newLeft,
    width: (durationDays + 1) * dayWidth, // +1 to include start day
    edge: null,
  };
};

const stopCardDrag = async () => {
  if (!draggingCard.value) return;

  try {
    // Calculate final delta in days
    const totalDays = timelineConfig.value.endDate.diff(
      timelineConfig.value.startDate,
      'day'
    );
    const dayWidth = chartWidth.value / totalDays;
    const deltaDays = Math.round(
      (tempPosition.value.left - initialDragPosition.value.startLeft) / dayWidth
    );

    // Calculate new dates
    const newStartsAt = initialDragPosition.value.startsAt.add(
      deltaDays,
      'day'
    );
    const newDueAt = initialDragPosition.value.dueAt.add(deltaDays, 'day');

    // Update card data
    const updates: Partial<Card['data']> = {};
    if (startsAtField.value) {
      updates[startsAtField.value.slug] = normalizeFieldValue({
        v: newStartsAt.startOf('day').toISOString(),
        field: startsAtField.value,
      });
    }
    if (dueAtField.value) {
      updates[dueAtField.value.slug] = normalizeFieldValue({
        v: newDueAt.endOf('day').toISOString(),
        field: dueAtField.value,
      });
    }

    await updateCard({
      id: draggingCard.value.id,
      data: { ...draggingCard.value.data, ...updates },
    } as Card);
  } finally {
    // Cleanup
    document.body.style.userSelect = '';
    draggingCard.value = null;
    tempPosition.value = { left: 0, width: 0, edge: null };
    window.removeEventListener('mousemove', handleCardDrag);
    window.removeEventListener('mouseup', stopCardDrag);
  }
};

const scrollToToday = () => {
  if (ganttChart.value && !!todayPosition.value) {
    ganttChart.value.scrollLeft =
      todayPosition.value - ganttChart.value.clientWidth / 6;
  }
};

const getVisualPosition = (card: Card) => {
  if (
    (resizingCard.value?.id === card.id && tempPosition.value.edge) ||
    (draggingCard.value?.id === card.id && tempPosition.value.edge === null)
  ) {
    return tempPosition.value;
  }
  return getCardPosition(card);
};

onMounted(() => {
  /** Show today's position on the Gantt chart on load */
  nextTick(() => {
    scrollToToday();
  });
});
</script>

<template>
  <v-container fluid class="gantt-view pa-0">
    <v-card rounded="0">
      <v-card-text class="pa-0">
        <v-sheet class="gantt-container overflow-auto d-flex">
          <v-sheet
            class="gantt-cards flex-1-0 position-relative overflow-auto border-e-thin"
            width="300"
          >
            <v-sheet height="49" class="pa-2 d-flex align-center flex-wrap">
              <v-chip
                class="text-caption"
                color="primary"
                density="compact"
                variant="outlined"
                rounded="md"
                @click="scrollToToday"
                >Today</v-chip
              >
            </v-sheet>
            <v-list>
              <template v-for="card in allCards" :key="card.id">
                <v-list-item
                  class="position-relative border-t-thin"
                  :height="rowHeight"
                >
                  <v-list-item-title>{{ card.data.title }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-sheet>

          <div
            ref="ganttChart"
            class="gantt-chart position-relative overflow-auto"
            :style="{ width: `${chartWidth}px` }"
            @mousedown="startDragging"
            @mousemove="drag"
            @mouseup="stopDragging"
            @mouseleave="stopDragging"
            style="cursor: grab"
          >
            <v-sheet
              class="gantt-header position-sticky top-0"
              style="z-index: 2; background-color: white"
              :width="chartWidth"
            >
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
            </v-sheet>
            <v-sheet class="gantt-rows">
              <div
                class="today-indicator border-s-lg border-primary"
                :style="{
                  position: 'absolute',
                  top: '58px',
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
                <div
                  class="gantt-row d-flex align-center border-t-thin"
                  :style="{
                    height: `${rowHeight}px`,
                    width: `${chartWidth}px`,
                    zIndex: 1,
                  }"
                  :data-card-id="card.id"
                >
                  &nbsp;
                  <v-card
                    v-if="getCardPosition(card)"
                    color="primary"
                    variant="tonal"
                    class="text-caption px-2 py-1 card-item"
                    rounded="pill"
                    :style="{
                      position: 'absolute',
                      zIndex: 1,
                      left: `${getVisualPosition(card)?.left}px`,
                      width: `${getVisualPosition(card)?.width}px`,
                      transition:
                        resizingCard?.id === card.id ||
                        draggingCard?.id === card.id
                          ? 'none'
                          : 'all 0.2s',
                      cursor:
                        draggingCard?.id === card.id ? 'grabbing' : 'grab',
                    }"
                    @mousedown="startCardDrag($event, card)"
                  >
                    <span class="d-block text-truncate">
                      {{ card.data.title }}
                    </span>

                    <div
                      class="drag-handle left"
                      @mousedown.stop="startResize($event, card, 'left')"
                    ></div>
                    <div
                      class="drag-handle right"
                      @mousedown.stop="startResize($event, card, 'right')"
                    ></div>
                  </v-card>
                </div>
              </template>
            </v-sheet>
          </div>
        </v-sheet>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style lang="scss" scoped>
.drag-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  z-index: 2;
  opacity: 0.5;
  transition: opacity 0.2s;

  &:hover,
  .card-item:hover & {
    opacity: 1;
    background: rgba(255, 255, 255, 0.3);
  }

  &.left {
    left: -2px;
  }

  &.right {
    right: -2px;
  }
}

.card-item {
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}
</style>
