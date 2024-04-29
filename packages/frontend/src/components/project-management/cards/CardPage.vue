<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCardsService } from '@/composables/services/useCardsService';
import { useQuery } from '@tanstack/vue-query';
import BaseCard from './BaseCard.vue';

const route = useRoute();
const cardsService = useCardsService();

const cardId = computed(() => route.params.cardId);

const getCardQuery = useQuery({
  queryKey: ['cards', cardId.value],
  queryFn: () => cardsService.getCard(+cardId.value),
});

const card = computed(() => getCardQuery.data.value);
</script>

<template>
  <base-card v-model="card" />
</template>
