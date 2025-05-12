<script setup lang="ts">
import { quickFilterDateOptions } from '@/components/common/views/BaseViewChipFilter/quickFilter';

import { isEqual } from 'lodash';

import MenuWrapper from '@/components/common/base/ContextMenu/MenuWrapper.vue';

const attrs = useAttrs();

const selected = defineModel<string[] | undefined>();

const selectedOption = computed(() =>
  quickFilterDateOptions.find((option) => isEqual(option.value, selected.value))
);

const chipLabel = computed(() => {
  if (!selected.value?.length || !selectedOption.value) {
    return 'Due date';
  }

  return `Due date is ${selectedOption.value.title}`;
});

function clearValue() {
  selected.value = undefined;
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
        class="text-caption text-medium-emphasis bg-accent-lighten"
        density="compact"
        border="thin"
        :style="{
          width: 'fit-content',
        }"
      >
        <template #prepend>
          <v-icon icon="mdi-calendar" start />
        </template>
        {{ chipLabel }}

        <template #close v-if="selected?.length">
          <v-btn
            icon
            density="compact"
            size="small"
            color="transparent"
            variant="flat"
            @click.stop="clearValue"
          >
            <v-icon icon="mdi-close" />
          </v-btn>
        </template>
      </v-chip>
    </template>
    <menu-wrapper
      v-model="selected"
      :items="quickFilterDateOptions"
      selectable
    />
  </v-menu>
</template>
