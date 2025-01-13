<script setup lang="ts">
import { CardTypeLayout, type Card } from '@tillywork/shared';

import { useStateStore } from '@/stores/state';

import BaseCardTask from './BaseCardTask.vue';
import BaseCardEntity from './BaseCardEntity.vue';

const { card } = defineProps<{
  card: Card;
}>();

const { setCurrentCard } = useStateStore();

watch(
  () => card,
  (v) => setCurrentCard(v),
  { immediate: true }
);
</script>

<template>
  <template v-if="card.type.layout === CardTypeLayout.DEFAULT">
    <base-card-task :card />
  </template>
  <template v-else>
    <base-card-entity :card />
  </template>
</template>
