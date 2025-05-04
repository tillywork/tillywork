<script setup lang="ts">
import { CardTypeLayout, type Card } from '@tillywork/shared';

import { useStateStore } from '@/stores/state';

import BaseCardTask from './BaseCardTask.vue';
import BaseCardEntity from './BaseCardEntity.vue';

const {
  card,
  hideBackButton = false,
  temporaryDrawer = false,
  closable = false,
} = defineProps<{
  card: Card;
  hideBackButton?: boolean;
  temporaryDrawer?: boolean;
  closable?: boolean;
}>();

const emit = defineEmits(['close']);

const { setCurrentCard } = useStateStore();

function handleClose() {
  emit('close');
}

watch(
  () => card,
  (v) => setCurrentCard(v),
  { immediate: true }
);

onBeforeUnmount(() => {
  setCurrentCard(null);
});
</script>

<template>
  <template v-if="card.type.layout === CardTypeLayout.DEFAULT">
    <base-card-task
      :card
      :hideBackButton
      :temporaryDrawer
      :closable
      @close="handleClose"
    />
  </template>
  <template v-else>
    <base-card-entity :card />
  </template>
</template>
