<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCardsService } from '@/composables/services/useCardsService';
import BaseCard from './BaseCard.vue';

const route = useRoute();
const cardsService = useCardsService();

const cardId = computed(() => route.params.cardId);

const getCardQuery = cardsService.useGetCardQuery(+cardId.value);

const card = computed(() => getCardQuery.data.value);
</script>

<template>
  <base-card v-if="card" :card />
</template>
