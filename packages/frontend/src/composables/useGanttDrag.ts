import { useFieldQueryStore } from '@/stores/field.query';
import { type Card } from '@tillywork/shared';
import { useCard } from './useCard';
import type { TimelineConfig } from './useGanttChart';

/**
 * Handles click and dragging the gantt chart to scroll.
 * @param ganttChart Used to update the chart scroll
 * @param allCards Used to handle clicking a card row
 * @returns
 */
export const useGanttDrag = (
  ganttChart: Ref<HTMLElement | null>,
  allCards: Ref<Card[]>,
  timelineConfig: Ref<TimelineConfig>,
  columnWidth: Ref<number>
) => {
  const isDragging = ref(false);
  const startX = ref(0);
  const scrollLeft = ref(0);

  const { fields } = storeToRefs(useFieldQueryStore());
  const { normalizeFieldValue, updateCard } = useCard();

  const dueAtField = computed(() =>
    fields.value?.find((f) => f.slug === 'due_at')
  );
  const startsAtField = computed(() =>
    fields.value?.find((f) => f.slug === 'starts_at')
  );

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
    if (!ganttChart.value || (card.data.starts_at && card.data.due_at)) return;

    const rect = ganttChart.value.getBoundingClientRect();
    const scrollLeft = ganttChart.value.scrollLeft;
    const clickX = event.clientX - rect.left + scrollLeft;

    const daysOffset = Math.floor(clickX / columnWidth.value);
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

  return { startDragging, drag, stopDragging, handleRowClick };
};
