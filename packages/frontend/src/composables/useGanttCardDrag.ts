import { useFieldQueryStore } from '@/stores/field.query';

import { useCard } from './useCard';

import { dayjs, type Card } from '@tillywork/shared';
import type { TimelineConfig } from './useGanttChart';
import type GanttChart from '@/components/common/views/GanttView/GanttChart.vue';

/**
 * Handles dragging the card across the gantt chart.
 */
export const useGanttCardDrag = ({
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
  const draggingCard = ref<Card | null>(null);
  const isDragging = ref<boolean>(false);
  const initialDragPosition = ref({
    x: 0,
    scrollLeft: 0,
    startLeft: 0,
    startsAt: dayjs(),
    dueAt: dayjs(),
  });
  const tempPosition = ref<{
    left: number;
    width: number;
    edge: 'left' | 'right' | null;
  }>({ left: 0, width: 0, edge: null });

  const { dueAtField, startsAtField } = storeToRefs(useFieldQueryStore());
  const { normalizeFieldValue, updateCard } = useCard();

  const startCardDrag = (e: MouseEvent) => {
    e.stopPropagation();
    if (!ganttChart?.value.el) return;

    if (!position.value) return;

    draggingCard.value = toValue(card);
    isDragging.value = true;

    // Store initial positions with scroll consideration
    initialDragPosition.value = {
      x: e.clientX,
      scrollLeft: ganttChart.value.el.scrollLeft,
      startLeft: position.value.left,
      startsAt: dayjs(toValue(card).data.starts_at),
      dueAt: dayjs(toValue(card).data.due_at),
    };

    // Initialize temporary position
    tempPosition.value = {
      left: position.value.left,
      width: position.value.width,
      edge: null,
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleCardDrag);
    window.addEventListener('mouseup', stopCardDrag);
  };

  const handleCardDrag = (e: MouseEvent) => {
    if (!draggingCard.value || !ganttChart?.value.el) return;

    // Calculate deltaX with scroll compensation
    const deltaX =
      e.clientX -
      initialDragPosition.value.x +
      (initialDragPosition.value.scrollLeft - ganttChart.value.el.scrollLeft);

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
        (tempPosition.value.left - initialDragPosition.value.startLeft) /
          dayWidth
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

      card.value = {
        ...card.value,
        data: {
          ...card.value.data,
          ...updates,
        },
      };

      await updateCard({
        id: draggingCard.value.id,
        data: { ...draggingCard.value.data, ...updates },
      } as Card);
    } finally {
      // Cleanup
      document.body.style.userSelect = '';
      draggingCard.value = null;
      isDragging.value = false;
      tempPosition.value = { left: 0, width: 0, edge: null };
      window.removeEventListener('mousemove', handleCardDrag);
      window.removeEventListener('mouseup', stopCardDrag);
    }
  };

  const virtualPosition = computed(() => {
    if (!tempPosition.value.edge) {
      return tempPosition.value;
    }

    return position.value;
  });

  return { startCardDrag, isDragging, virtualPosition };
};
