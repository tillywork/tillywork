<script setup lang="ts">
import { useCardsService } from '@/services/useCardsService';
import type { Card } from './types';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import { useFields } from '@/composables/useFields';

const props = defineProps<{
  card: Pick<Card, 'id'>;
  maxWidth?: number;
  disableLink?: boolean;
  hideStage?: boolean;
}>();

const cardId = computed(() => props.card.id);
const cardTypeId = computed(() => cardCopy.value?.type.id ?? 0);
const cardTypeFieldsEnabled = computed(() => !!cardCopy.value);

const { useGetCardQuery } = useCardsService();
const { data: cardCopy } = useGetCardQuery({
  cardId,
});

const { titleField } = useFields({
  cardTypeId,
  enabled: cardTypeFieldsEnabled,
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
      <template v-if="cardCopy && titleField">
        <list-stage-selector
          v-if="!hideStage && cardCopy.cardLists[0].listStage"
          :model-value="cardCopy.cardLists[0].listStage"
          :list-stages="[]"
          theme="icon"
          readonly
        />
        {{ cardCopy.data[titleField.slug] }}
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
