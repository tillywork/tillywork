<script setup lang="ts">
import { ref } from 'vue';
import { type ListStage } from '../../project-management/lists/types';

const selectedStage = defineModel<ListStage>();
const listStageMenu = ref(false);
defineExpose({
  listStageMenu,
});
const props = defineProps<{
  listStages: ListStage[];
}>();

function handleStageClick(stage: ListStage) {
  selectedStage.value = stage;
}

function isStageSelected(stage: ListStage) {
  return selectedStage.value && selectedStage.value.id === stage.id;
}
</script>

<template>
  <!-- <v-select v-model="selectedStage" :items="listStages" label="Select Stage" item-title="name" item-value="id" /> -->
  <v-menu v-model="listStageMenu">
    <template #activator="{ props }">
      <v-chip
        v-bind="props"
        link
        rounded="md"
        size="small"
        density="comfortable"
        :color="selectedStage?.color"
        >{{ selectedStage?.name }}</v-chip
      >
    </template>
    <v-list
      v-model="selectedStage"
      density="compact"
      :lines="false"
      nav
      class="mt-1 list-stage-list text-align-left"
      rounded="md"
    >
      <template v-for="stage in listStages" :key="stage.id">
        <v-list-item
          @click="handleStageClick(stage)"
          class="d-flex"
          slim
          :active="isStageSelected(stage)"
        >
          <template #prepend>
            <v-icon size="12" :color="stage.color">mdi-circle</v-icon>
          </template>
          <template #append v-if="isStageSelected(stage)">
            <v-icon size="12" class="ms-2">mdi-check</v-icon>
          </template>
          <v-list-item-title
            :class="isStageSelected(stage) ? 'font-weight-bold' : ''"
          >
            {{ stage.name }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>
