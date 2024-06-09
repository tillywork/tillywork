<script setup lang="ts">
import BaseCard from '@/components/project-management/cards/BaseCard.vue';
import { useCardsService } from '@/composables/services/useCardsService';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute('/pm/card/[cardId]');
const cardsService = useCardsService();
const cardId = computed(() => +route.params.cardId);

const { data: card, refetch } = cardsService.useGetCardQuery({
  cardId,
});

watch(
  card,
  (v) => {
    if (v) {
      document.title = `${v.title} - tillywork`;
    }
  },
  { immediate: true }
);

watch(
  () => route.params.cardId,
  () => {
    refetch();
  }
);
</script>

<template>
  <base-card v-if="card" :card />
</template>
