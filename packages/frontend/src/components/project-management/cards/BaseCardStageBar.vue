<script setup lang="ts">
import { useCard } from '@/composables/useCard';
import type { Card, Field, FieldItem } from '@tillywork/shared';

const { field, card } = defineProps<{
  field: Field;
  card: Card;
}>();

const selectedStage = defineModel<string>();

const { updateFieldValue } = useCard();

watch(selectedStage, (v) => {
  updateFieldValue({ card, field, v });
});

watch(
  () => card.id,
  () => {
    if (card.data[field.slug] && card.data[field.slug].length) {
      selectedStage.value = card.data[field.slug][0];
    }
  },
  { immediate: true }
);

function isStageSelected(stage: FieldItem) {
  return selectedStage.value === stage.item;
}
</script>

<template>
  <v-chip-group v-model="selectedStage" show-arrows>
    <template v-for="stage in field.items" :key="stage">
      <v-chip
        :color="stage.color"
        :value="stage.item"
        :class="{
          'font-weight-bold': isStageSelected(stage),
        }"
        density="comfortable"
      >
        <span class="text-caption">
          {{ stage.item }}
        </span>
        <template #append v-if="isStageSelected(stage)">
          <v-icon size="12" icon="mdi-check" class="ms-2" />
        </template>
      </v-chip>
    </template>
  </v-chip-group>
</template>
