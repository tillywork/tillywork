<script setup lang="ts">
import type { Card } from '@tillywork/shared';
import type { VSheet } from 'vuetify/components';

import GanttCard from './GanttCard.vue';
import type GanttChart from './GanttChart.vue';

const props = defineProps<{
  allCards: Card[];
  rowHeight: number;
}>();

const emit = defineEmits(['scroll', 'load']);

const ganttChart = inject<Ref<InstanceType<typeof GanttChart>> | null>(
  'ganttChart',
  null
);

const cardsCopy = ref<Card[]>();
const listContainer = ref<VSheet | null>(null);
const isLoadingMore = ref(false);
const isNextPageEmpty = ref(false);

watchEffect(() => {
  cardsCopy.value = props.allCards;
});

const handleScroll = async (e: Event) => {
  emit('scroll', e);

  if (shouldLoadMore(e)) {
    isLoadingMore.value = true;

    await new Promise<void>((resolve) => {
      emit('load', {
        done: (status?: string) => {
          if (status === 'empty') {
            isLoadingMore.value = false;
            isNextPageEmpty.value = true;
          } else if (status === 'ok') {
            isLoadingMore.value = false;
          }
          resolve();
        },
      });
    });
  }
};

const shouldLoadMore = (e: Event) => {
  const container = e.target as HTMLElement;

  return (
    !isNextPageEmpty.value &&
    !isLoadingMore.value &&
    container.scrollHeight - container.scrollTop <= container.clientHeight + 100
  );
};

const handleScrollToCard = (card: Card) => {
  if (ganttChart?.value) {
    ganttChart.value.scrollToCard(`${card.id}`);
  }
};
</script>

<template>
  <v-sheet
    ref="listContainer"
    class="gantt-cards flex-shrink-0 border-e-thin overflow-auto h-100 pt-8"
    width="300"
    @scroll="handleScroll"
  >
    <v-list v-memo="cardsCopy" class="pa-0">
      <template v-if="cardsCopy">
        <template v-for="(card, index) in cardsCopy" :key="card.id">
          <gantt-card
            v-model="cardsCopy[index]"
            :height="rowHeight"
            @click:scroll="handleScrollToCard"
          />
        </template>
      </template>
    </v-list>
  </v-sheet>
</template>
