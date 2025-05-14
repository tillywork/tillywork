<script setup lang="ts">
import { useCardsService } from '@/services/useCardsService';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import type { Card } from '@tillywork/shared';
import { useFields } from '@/composables/useFields';
import { useCard } from '@/composables/useCard';

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

const { titleField } = useFields({
  cardTypeId: computed(() => Number(cardCopy.value?.type.id)),
  enabled: computed(() => !!cardCopy.value),
});

const { getCardTitle } = useCard();

const cardTitle = computed(() =>
  getCardTitle(cardCopy as Ref<Card>, titleField)
);
</script>

<template>
  <v-card
    class="d-flex align-center text-caption pe-2"
    :class="{
      'ps-2': hideStage || !cardCopy?.cardLists[0].listStageId,
    }"
    :to="!disableLink ? `/card/${card.id}` : undefined"
    :max-width="maxWidth ?? 250"
    variant="tonal"
    height="28"
    rounded="pill"
  >
    <div class="d-inline-block text-truncate">
      <template v-if="cardCopy && cardTitle">
        <list-stage-selector
          v-if="!hideStage && cardCopy.cardLists[0].listStage"
          :model-value="cardCopy.cardLists[0].listStage"
          :list-stages="[]"
          theme="icon"
          readonly
        />
        <span>
          {{ cardTitle }}
        </span>
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
