<script setup lang="ts">
import BaseCard from '@/components/project-management/cards/BaseCard/BaseCard.vue';

import { useCardsService } from '@/services/useCardsService';

const route = useRoute('/card/[cardId]');

const { useGetCardQuery } = useCardsService();

const cardId = computed(() => +route.params.cardId);

const { data: card, refetch } = useGetCardQuery({
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
