<script setup lang="ts">
import { quickFilterDateOptions } from '@/components/project-management/views/BaseViewChipFilter/quickFilter';
import type { QuickFilterDateOption } from '@tillywork/shared';
import { isEqual } from 'lodash';

const attrs = useAttrs();

const selected = defineModel<string[] | undefined>();

const selectedOption = computed(() =>
  quickFilterDateOptions.find((option) => isEqual(option.value, selected.value))
);

function isOptionSelected(option: QuickFilterDateOption) {
  return selectedOption.value?.title === option.title;
}

function handleOptionSelected(option: QuickFilterDateOption) {
  if (!isEqual(selected.value, option.value)) {
    selected.value = option.value;
  } else {
    selected.value = undefined;
  }
}
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <v-chip
        v-bind="{
          ...props,
          ...attrs,
        }"
        variant="tonal"
        rounded="pill"
        class="text-caption"
        color="primary"
        density="comfortable"
      >
        <template #prepend>
          <v-icon icon="mdi-calendar" start />
        </template>
        <template v-if="!selectedOption"> Due Date </template>
        <template v-else>
          {{ selectedOption.title }}
        </template>
      </v-chip>
    </template>
    <v-card>
      <v-list>
        <template v-for="option in quickFilterDateOptions" :key="option.title">
          <v-list-item
            @click="handleOptionSelected(option)"
            :active="isOptionSelected(option)"
          >
            <v-list-item-title>
              {{ option.title }}
            </v-list-item-title>
            <template #append>
              <v-icon
                v-if="isOptionSelected(option)"
                icon="mdi-check"
                size="12"
                end
              />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
