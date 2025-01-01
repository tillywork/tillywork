<script setup lang="ts">
import { CardTypeLayout, type Card } from '@tillywork/shared';
import BaseCardTask from './BaseCardTask.vue';
import BaseCardEntity from './BaseCardEntity.vue';

const { card } = defineProps<{
  card: Card;
}>();
</script>

<template>
  <template v-if="card.type.layout === CardTypeLayout.DEFAULT">
    <base-card-task :card />
  </template>
  <template v-else>
    <base-card-entity :card />
  </template>
</template>
