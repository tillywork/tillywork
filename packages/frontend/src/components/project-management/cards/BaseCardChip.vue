<script setup lang="ts">
import { useCardsService } from '@/composables/services/useCardsService';
import type { Card } from './types';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';

const props = defineProps<{
  card: Card;
  maxWidth?: number;
}>();

const cardId = computed(() => props.card.id);

const { useGetCardQuery } = useCardsService();
const { data: cardCopy } = useGetCardQuery({
  cardId,
});
</script>

<template>
  <v-card
    class="d-flex align-center text-caption pe-2"
    :to="`/pm/card/${card.id}`"
    :max-width="maxWidth ?? 250"
    color="surface-variant"
    variant="tonal"
    height="28"
  >
    <div class="d-inline-block text-truncate">
      <list-stage-selector
        v-if="cardCopy"
        :model-value="cardCopy.cardLists[0].listStage"
        :list-stages="[]"
        theme="icon"
        readonly
      />
      <template v-else>
        <v-progress-circular
          indeterminate
          color="primary"
          size="14"
          class="mx-2"
          width="2"
        />
      </template>
      {{ card.title }}
    </div>
  </v-card>
</template>
