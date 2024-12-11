<script setup lang="ts">
import { CardTypeLayout, type Card } from '@tillywork/shared';
import BaseCardTask from './BaseCardTask.vue';
import BaseCardPerson from './BaseCardPerson.vue';

const { card } = defineProps<{
  card: Card;
}>();
</script>

<template>
  <template v-if="card.type.layout === CardTypeLayout.DEFAULT">
    <base-card-task :card />
  </template>
  <template v-else-if="card.type.layout === CardTypeLayout.PERSON">
    <base-card-person :card />
  </template>
</template>
