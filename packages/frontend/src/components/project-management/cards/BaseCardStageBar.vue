<script setup lang="ts">
import type { ListStage } from '@tillywork/shared';

const { listStages } = defineProps<{
  listStages: ListStage[];
}>();

const selectedStage = defineModel<ListStage>();

function isStageSelected(stage: ListStage) {
  return selectedStage.value?.id === stage.id;
}
</script>

<template>
  <v-chip-group v-model="selectedStage" show-arrows>
    <template v-for="stage in listStages" :key="stage">
      <v-chip
        :color="stage.color"
        :value="stage"
        :class="{
          'font-weight-bold': isStageSelected(stage),
        }"
        density="comfortable"
      >
        <span class="text-caption">
          {{ stage.name }}
        </span>
        <template #append v-if="isStageSelected(stage)">
          <v-icon size="12" icon="mdi-check" class="ms-2" />
        </template>
      </v-chip>
    </template>
  </v-chip-group>
</template>
