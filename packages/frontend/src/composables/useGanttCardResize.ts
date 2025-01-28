/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useFieldQueryStore } from '@/stores/field.query';

import { useCard } from './useCard';

import { type Card, dayjs } from '@tillywork/shared';
import type { TimelineConfig } from './useGanttChart';
import type GanttChart from '@/components/common/views/GanttView/GanttChart.vue';

/**
 * Handles updating the card due at and starts at by dragging the left and right of the card.
 */
export const useGanttCardResize = ({
  ganttChart,
  timelineConfig,
  chartWidth,
  position,
  card,
}: {
  ganttChart: Ref<InstanceType<typeof GanttChart>> | null;
  timelineConfig: Ref<TimelineConfig>;
  chartWidth: Ref<number>;
  position: ComputedRef<{ left: number; width: number } | null>;
  card: Ref<Card>;
}) => {
  const { startsAtField, dueAtField } = storeToRefs(useFieldQueryStore());
  const { normalizeFieldValue, updateCard } = useCard();

  const isResizing = ref<boolean>(false);
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
    if (!ganttChart?.value.el) return;
    if (!position.value) return;

    // Store initial values
    resizingCard.value = card;
    resizingEdge.value = edge;
    initialX.value = e.clientX;
    initialScrollLeft.value = ganttChart.value.el.scrollLeft;
    isResizing.value = true;

    // Store initial dates and metrics
    initialDates.value = {
      startsAt: dayjs(card.data.starts_at),
      dueAt: dayjs(card.data.due_at),
    };
    initialCardMetrics.value = {
      left: position.value.left,
      width: position.value.width,
    };

    // Initialize temporary position
    tempPosition.value = {
      left: position.value.left,
      width: position.value.width,
      edge: edge,
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e: MouseEvent) => {
    if (
      !resizingCard.value ||
      !ganttChart?.value.el ||
      !initialCardMetrics.value
    )
      return;

    // Calculate deltaX with scroll adjustment
    const deltaX =
      e.clientX -
      initialX.value +
      (initialScrollLeft.value - ganttChart.value.el.scrollLeft);

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

      card.value = {
        ...card.value,
        data: {
          ...card.value.data,
          ...updates,
        },
      };

      await updateCard({
        id: resizingCard.value.id,
        data: { ...resizingCard.value.data, ...updates },
      } as Card);
    } finally {
      // Reset state
      document.body.style.userSelect = '';
      resizingCard.value = null;
      resizingEdge.value = null;
      isResizing.value = false;
      tempPosition.value = { left: 0, width: 0, edge: null };
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    }
  };

  const virtualPosition = computed(() => {
    if (tempPosition.value.edge) {
      return tempPosition.value;
    }

    return position.value;
  });

  return { startResize, isResizing, virtualPosition };
};
