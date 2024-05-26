<script setup lang="ts">
import { useCardsService } from '@/composables/services/useCardsService';
import BaseCard from './BaseCard.vue';

const route = useRoute('/pm/card/[cardId]');
const cardsService = useCardsService();

const cardId = computed(() => route.params.cardId);

const getCardQuery = cardsService.useGetCardQuery(+cardId.value);

const card = computed(() => getCardQuery.data.value);
</script>

<template>
  <base-card v-if="card" :card />
</template>
