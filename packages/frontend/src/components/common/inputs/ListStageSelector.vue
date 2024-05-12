<script setup lang="ts">
import { ref } from 'vue';
import { type ListStage } from '../../project-management/lists/types';
import BaseIconBtn from '../base/BaseIconBtn.vue';
import { computed } from 'vue';

const selectedStage = defineModel<ListStage>();
const listStageMenu = ref(false);

defineExpose({
  listStageMenu,
});
defineProps<{
  listStages: ListStage[];
  theme?: 'icon' | 'text' | 'default';
  label?: string;
  size?: 'x-small' | 'small' | 'default';
}>();

const mainChipColor = computed(() => {
  return selectedStage.value?.color;
});

function handleStageClick(stage: ListStage) {
  selectedStage.value = stage;
}

function isStageSelected(stage: ListStage) {
  return selectedStage.value && selectedStage.value.id === stage.id;
}
</script>

<template>
  <v-menu v-model="listStageMenu" offset="3">
    <template #activator="{ props }">
      <template v-if="theme === 'icon'">
        <base-icon-btn
          v-bind="props"
          icon="mdi-circle-slice-8"
          :color="mainChipColor"
        />
      </template>
      <template v-else>
        <v-chip
          v-bind="props"
          link
          rounded="md"
          :size="size ?? 'small'"
          density="comfortable"
          :color="mainChipColor"
        >
          <v-icon size="16" :color="mainChipColor" start v-if="theme !== 'text'"
            >mdi-circle-slice-8</v-icon
          >
          <span class="text-caption">{{
            selectedStage?.name ?? label ?? 'Stage'
          }}</span>
        </v-chip>
      </template>
    </template>
    <v-card color="accent">
      <v-list
        density="compact"
        :lines="false"
        nav
        class="bg-accent mt-1 list-stage-list text-align-left"
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
              <v-icon size="16" :color="stage.color">mdi-circle-slice-8</v-icon>
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
    </v-card>
  </v-menu>
</template>
