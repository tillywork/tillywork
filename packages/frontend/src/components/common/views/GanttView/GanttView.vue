<script setup lang="ts">
import {
  type TimelineConfig,
  useGanttChart,
} from '@/composables/useGanttChart';

import { useCardsService, type CardsData } from '@/services/useCardsService';

import {
  type Card,
  type List,
  type ListGroup,
  type QueryFilter,
  type View,
  type ViewFilter,
  dayjs,
} from '@tillywork/shared';
import type { VSheet } from 'vuetify/components';

import { cloneDeep } from 'lodash';

import GanttChart from './GanttChart.vue';

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

const { useGetGroupCardsInfinite } = useCardsService();
const {
  data: cardPages,
  refetch,
  isFetching,
  fetchNextPage,
  hasNextPage,
} = useGetGroupCardsInfinite({
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
  startDate: dayjs().subtract(1, 'month').startOf('week'),
  endDate: dayjs().add(1, 'month').endOf('week'),
});

const { chartWidth, todayPosition, headers, columnWidth } = useGanttChart({
  list,
  view,
  timelineConfig,
});

const ganttChart = ref<InstanceType<typeof GanttChart>>();
provide('ganttChart', ganttChart);

const handleLoadNextPage = async ({
  done,
}: {
  done: (status?: string) => void;
}) => {
  if (!isFetching.value) {
    await fetchNextPage();
    if (hasNextPage.value) {
      done('ok');
    } else {
      done('empty');
    }
  } else {
    done('ok');
  }
};
</script>

<template>
  <v-sheet
    rounded="0"
    class="overflow-auto"
    :height="`calc(100vh - 145px${
      $vuetify.display.mdAndDown ? ' - 40px' : ''
    })`"
  >
    <gantt-chart
      ref="ganttChart"
      :headers
      :todayPosition
      :chartWidth
      :columnWidth
      :rowHeight
      :timelineConfig
      :allCards
      @load="handleLoadNextPage"
    />
  </v-sheet>
</template>
