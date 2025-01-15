<script setup lang="ts">
import type { ListStage } from '@tillywork/shared';

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
  readonly?: boolean;
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
  <v-menu v-model="listStageMenu">
    <template #activator="{ props }">
      <template v-if="theme === 'icon'">
        <base-icon-btn
          v-bind="!readonly ? props : undefined"
          icon="mdi-circle-slice-8"
          :color="mainChipColor"
          @click.prevent
          :readonly
        />
      </template>
      <template v-else>
        <v-chip
          v-bind="!readonly ? props : undefined"
          :link="!readonly"
          rounded="pill"
          density="comfortable"
          :color="mainChipColor"
          @click.prevent
        >
          <v-icon
            size="small"
            :color="mainChipColor"
            start
            v-if="theme !== 'text'"
            >mdi-circle-slice-8</v-icon
          >
          <span class="text-caption">{{
            selectedStage?.name ?? label ?? 'Stage'
          }}</span>
        </v-chip>
      </template>
    </template>
    <v-card>
      <v-list class="text-align-left">
        <template v-for="stage in listStages" :key="stage.id">
          <v-list-item
            @click="handleStageClick(stage)"
            :active="isStageSelected(stage)"
          >
            <template #prepend>
              <v-icon size="x-small" :color="stage.color"
                >mdi-circle-slice-8</v-icon
              >
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
