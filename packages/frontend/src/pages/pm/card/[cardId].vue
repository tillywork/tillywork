<script setup lang="ts">
import BaseCard from '@/components/project-management/cards/BaseCard.vue';
import { useCardsService } from '@/composables/services/useCardsService';

const route = useRoute('/pm/card/[cardId]');
const cardsService = useCardsService();

const { data: card } = cardsService.useGetCardQuery(+route.params.cardId);

watch(
  card,
  (v) => {
    if (v) {
      document.title = `${v.title} - tillywork`;
    }
  },
  { immediate: true }
);
</script>

<template>
  <base-card v-if="card" :card />
</template>
