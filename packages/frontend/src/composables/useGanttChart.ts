import type { MaybeRef } from 'vue';

import { type List, type View, dayjs } from '@tillywork/shared';
export type TimelineViewMode = 'day' | 'week' | 'month' | 'year';

export interface TimelineHeader {
  type: TimelineViewMode;
  label: string;
  appendLabel?: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  width: number;
}

export interface TimelineConfig {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
}

export const useGanttChart = ({
  timelineConfig,
}: {
  list: MaybeRef<List>;
  view: MaybeRef<View>;
  timelineConfig: Ref<TimelineConfig>;
}) => {
  // Calculate total days in timeline
  const totalDays = computed(() => {
    const diff = timelineConfig.value.endDate.diff(
      timelineConfig.value.startDate,
      'day'
    );

    // dayjs.diff is not inclusive, so we add 1 day to the calculation to get the correct number
    return diff + 1;
  });

  // Calculate column width based on view mode
  const columnWidth = computed(() => 75);

  // Calculate chart width
  const chartWidth = computed(() => {
    return totalDays.value * columnWidth.value;
  });

  // Update timeline configuration
  const updateTimelineConfig = (config: Partial<TimelineConfig>) => {
    timelineConfig.value = {
      ...timelineConfig.value,
      ...config,
    };
  };

  // Get today's position
  const todayPosition = computed(() => {
    const today = dayjs();
    const diffDays = today.diff(timelineConfig.value.startDate, 'day');
    return diffDays * columnWidth.value;
  });

  // Generate headers based on view mode
  const headers = computed(() => {
    const headers: TimelineHeader[] = [];
    const startDate = timelineConfig.value.startDate;
    const endDate = timelineConfig.value.endDate;
    let currentDate = startDate.startOf('week');

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      const weekNumber = currentDate.week();
      const weekStart = currentDate.startOf('week');
      const weekEnd = currentDate.endOf('week');

      // Only process week if any part of the week is within the timeline
      if (weekEnd.isAfter(startDate)) {
        // Calculate visible days in the week
        const visibleDays = Array.from({ length: 7 }, (_, i) =>
          weekStart.add(i, 'day')
        ).filter(
          (day) => day.isSameOrAfter(startDate) && day.isSameOrBefore(endDate)
        );

        // Calculate week width based on visible days
        const weekWidth = visibleDays.length * columnWidth.value;

        headers.push({
          type: 'week',
          label: `${weekStart.format('D MMM')} - ${weekEnd.format('D MMM')}`,
          appendLabel: `W${weekNumber}`,
          start: weekStart,
          end: weekEnd,
          width: weekWidth,
        });

        // Add day headers
        visibleDays.forEach((dayStart) => {
          headers.push({
            type: 'day',
            label: dayStart.format('ddd D'),
            start: dayStart,
            end: dayStart.endOf('day'),
            width: columnWidth.value,
          });
        });
      }

      // Move to the next week
      currentDate = currentDate.add(1, 'week');
    }
    return headers;
  });

  return {
    chartWidth,
    columnWidth,
    todayPosition,
    updateTimelineConfig,
    headers,
  };
};
