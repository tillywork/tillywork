<script setup lang="ts">
import type { Card } from '@tillywork/shared';

const props = withDefaults(
  defineProps<{
    card: Card;
    border?: string;
    rounded?: string;
  }>(),
  {
    rounded: 'pill',
    border: 'thin',
  }
);

const totalChildren = computed(() => props.card.children.length);
const totalCompletedChildren = computed(
  () =>
    props.card.children.filter(
      (child) => child.cardLists[0].listStage.isCompleted
    ).length
);

const progress = computed(() => {
  const percentage = (totalCompletedChildren.value / totalChildren.value) * 100;

  if (percentage > 0) return percentage;

  return 5;
});
</script>

<template>
  <v-card :border class="pa-1" :rounded>
    <v-progress-circular
      v-model="progress"
      size="14"
      width="2"
      color="primary"
      class="me-1"
    />
    <span class="text-color-subtitle">
      {{ totalCompletedChildren }}/{{ totalChildren }}
    </span>
  </v-card>
</template>
