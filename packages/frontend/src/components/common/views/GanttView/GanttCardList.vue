<script setup lang="ts">
import { useFieldQueryStore } from '@/stores/field.query';
import { useQueryStore } from '@/stores/query';

import { useCard } from '@/composables/useCard';

import type { Card } from '@tillywork/shared';
import type { VSheet } from 'vuetify/components';

import ListStageSelector from '../../inputs/ListStageSelector.vue';
import type GanttChart from './GanttChart.vue';
import ContextMenu from '../../base/ContextMenu/ContextMenu.vue';
import { useStateStore } from '@/stores/state';

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

const { getCardContextMenuItems, updateCardStage } = useCard();

const { listStages } = storeToRefs(useQueryStore());
const { titleField } = storeToRefs(useFieldQueryStore());
const { setHoveredCard } = useStateStore();

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

const handleHoverCard = (card: Card, isHovering: boolean) => {
  if (isHovering) setHoveredCard(card);
  else setHoveredCard(null);
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
      <template v-for="card in cardsCopy" :key="card.id">
        <context-menu :items="getCardContextMenuItems(card)">
          <v-hover
            #="{ props }"
            @update:model-value="(v) => handleHoverCard(card, v)"
          >
            <v-list-item
              v-bind="props"
              class="position-relative border-t-thin"
              :height="rowHeight"
              :to="`/card/${card.id}`"
            >
              <template #prepend v-if="card.cardLists.length">
                <list-stage-selector
                  v-model="card.cardLists[0].listStage"
                  :listStages="listStages"
                  theme="icon"
                  @update:modelValue="
                    (v) =>
                      updateCardStage({
                        cardId: card.id,
                        cardListId: card.cardLists[0].id,
                        listStageId: v.id,
                      })
                  "
                />
              </template>
              <v-list-item-title v-if="titleField" class="ms-1">
                {{ card.data[titleField.slug] }}
              </v-list-item-title>
              <template #append>
                <v-btn
                  v-tooltip="`Go to ${card.type.name.toLowerCase()}`"
                  icon="mdi-arrow-right"
                  density="compact"
                  size="small"
                  variant="tonal"
                  color="default"
                  @click.prevent="handleScrollToCard(card)"
                />
              </template>
            </v-list-item>
          </v-hover>
        </context-menu>
      </template>
    </v-list>
  </v-sheet>
</template>
