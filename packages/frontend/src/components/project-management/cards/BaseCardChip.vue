<script setup lang="ts">
import { useCardsService } from '@/composables/services/useCardsService';
import type { Card } from './types';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';

const props = defineProps<{
  card: Pick<Card, 'id'>;
  maxWidth?: number;
  disableLink?: boolean;
  hideStage?: boolean;
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
    :class="hideStage && 'ps-2'"
    :to="!disableLink ? `/pm/card/${card.id}` : undefined"
    :max-width="maxWidth ?? 250"
    color="surface-variant"
    variant="tonal"
    height="28"
  >
    <div class="d-inline-block text-truncate">
      <template v-if="cardCopy">
        <list-stage-selector
          v-if="!hideStage"
          :model-value="cardCopy.cardLists[0].listStage"
          :list-stages="[]"
          theme="icon"
          readonly
        />
        {{ cardCopy.title }}
      </template>
      <template v-else>
        <v-progress-circular
          indeterminate
          color="primary"
          size="14"
          class="mx-2"
          width="2"
        />
      </template>
    </div>
  </v-card>
</template>
