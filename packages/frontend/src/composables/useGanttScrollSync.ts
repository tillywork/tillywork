import type { VSheet } from 'vuetify/components';

export const useGanttScrollSync = ({
  todayPosition,
  ganttChart,
  ganttHeader,
  ganttCardList,
}: {
  todayPosition: Ref<number>;
  ganttChart: Ref<HTMLElement | null>;
  ganttHeader: Ref<VSheet | null>;
  ganttCardList: Ref<VSheet | null>;
}) => {
  const verticalScrollPosition = ref(0);
  const horizontalScrollPosition = ref(0);

  watchEffect(() => {
    if (ganttChart.value) {
      ganttChart.value.scrollTop = verticalScrollPosition.value;
      ganttChart.value.scrollLeft = horizontalScrollPosition.value;
    }

    if (ganttCardList.value) {
      ganttCardList.value.$el.scrollTop = verticalScrollPosition.value;
    }

    if (ganttHeader.value) {
      ganttHeader.value.$el.scrollLeft = horizontalScrollPosition.value;
    }
  });

  /**
   * Handles syncing the scroll on both the XY axis
   * @param e Scroll Event
   */
  const handleXYScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    verticalScrollPosition.value = target.scrollTop;
    horizontalScrollPosition.value = target.scrollLeft;
  };

  /**
   * Handles syncing the scroll on the Y axis
   * @param e Scroll Event
   */
  const handleYScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    verticalScrollPosition.value = target.scrollTop;
  };

  /**
   * Handles syncing the scroll on the X axis
   * @param e Scroll Event
   */
  const handleXScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    horizontalScrollPosition.value = target.scrollLeft;
  };

  const scrollToToday = () => {
    if (ganttChart.value && !!todayPosition.value) {
      const newPosition =
        todayPosition.value - ganttChart.value.clientWidth / 6;
      ganttChart.value.scrollLeft = newPosition;
    }
  };

  return {
    handleXYScroll,
    handleXScroll,
    handleYScroll,
    scrollToToday,
  };
};
