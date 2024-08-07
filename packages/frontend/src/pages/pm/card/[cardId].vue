<script setup lang="ts">
import BaseCard from '@/components/project-management/cards/BaseCard.vue';
import { useCardsService } from '@/services/useCardsService';

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
  () => route.params.cardId,
  () => {
    refetch();
  }
);
</script>

<template>
  <base-card v-if="card" :card />
</template>
