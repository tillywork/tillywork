<script setup lang="ts">
import { useCard } from '@/composables/useCard';
import { useCardContextMenu } from '@/composables/useCardContextMenu';
import { useFields } from '@/composables/useFields';

import { useQueryStore } from '@/stores/query';

import type { Card } from '@tillywork/shared';

import ContextMenu from '../../base/ContextMenu/ContextMenu.vue';
import ListStageSelector from '../../inputs/ListStageSelector.vue';

const card = defineModel<Card>({
  required: true,
});

const { height } = defineProps<{
  height: any;
}>();

const emit = defineEmits(['click:scroll']);

const { listStages, list } = storeToRefs(useQueryStore());

const { titleField } = useFields({
  cardTypeId: computed(() => card.value.type.id),
  listId: computed(() => Number(list.value?.id)),
});

const { handleHoverCard, updateCardStage, getCardTitle } = useCard();
const { items, onUpdateMenuOpen } = useCardContextMenu(card.value);

const cardTitle = computed(() => getCardTitle(card.value, titleField));

function handleScrollToCard() {
  emit('click:scroll', card.value);
}
</script>

<template>
  <context-menu :items @update:open="onUpdateMenuOpen">
    <v-hover
      #="{ props }"
      @update:model-value="
        (v) =>
          handleHoverCard({
            isHovering: v,
            card,
          })
      "
    >
      <v-list-item
        v-bind="props"
        class="position-relative border-t-thin"
        :height
        :to="`/card/${card.id}`"
      >
        <template #prepend v-if="card.cardLists.length">
          <list-stage-selector
            v-model="card.cardLists[0].listStage"
            :listStages
            theme="icon"
            @update:modelValue="
              (v) => {
                if (v) {
                  updateCardStage({
                    cardId: card.id,
                    cardListId: card.cardLists[0].id,
                    listStageId: v.id,
                  });
                }
              }
            "
          />
        </template>
        <v-list-item-title v-if="cardTitle" class="ms-1">
          {{ cardTitle }}
        </v-list-item-title>
        <template #append>
          <v-btn
            v-tooltip="`Go to ${card.type.name.toLowerCase()}`"
            icon="mdi-arrow-right"
            density="compact"
            size="small"
            variant="tonal"
            color="default"
            @click.prevent="handleScrollToCard"
          />
        </template>
      </v-list-item>
    </v-hover>
  </context-menu>
</template>
