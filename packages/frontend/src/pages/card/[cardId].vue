<script setup lang="ts">
import BaseCard from '@/components/common/cards/BaseCard/BaseCard.vue';

import { useCardsService } from '@/services/useCardsService';
import { useStateStore } from '@/stores/state';

const route = useRoute('/card/[cardId]');

const { navigateToLastList } = useStateStore();

const { useGetCardQuery } = useCardsService();

const cardId = computed(() => +route.params.cardId);

const {
  data: card,
  refetch,
  error,
} = useGetCardQuery({
  cardId,
});

watch(
  () => route.params.cardId,
  () => {
    refetch();
  }
);

watch(error, (v) => {
  if (v?.message.includes('404')) {
    navigateToLastList();
  }
});
</script>

<template>
  <base-card v-if="card" :card />
</template>
