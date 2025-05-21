<script setup lang="ts">
import MenuWrapper from '../base/ContextMenu/MenuWrapper.vue';
import type { ContextMenuItem } from '../base/ContextMenu/types';

const model = defineModel<string | number | object | null | undefined>();

const {
  items,
  label = 'Select item',
  icon,
  clearable,
  readonly,
  color,
} = defineProps<{
  items: ContextMenuItem[];
  label?: string;
  icon?: string;
  clearable?: boolean;
  readonly?: boolean;
  color?: string;
}>();

const attrs = useAttrs();

const selectedItem = computed(() =>
  items.find((option) => option.value === model.value)
);

function clearSelection() {
  model.value = undefined;
}
</script>

<template>
  <v-menu :disabled="readonly">
    <template #activator="{ props }">
      <v-chip
        :color="selectedItem?.color ?? color"
        density="comfortable"
        class="text-caption"
        :class="{
          'pe-2': selectedItem && clearable,
        }"
        rounded="pill"
        variant="tonal"
        v-bind="{
          ...attrs,
          ...(readonly ? {} : props),
        }"
      >
        <template #prepend v-if="selectedItem?.icon || icon">
          <v-icon :icon="selectedItem?.icon || icon" class="me-2" />
        </template>
        {{ selectedItem?.title ?? label }}
        <template #append v-if="selectedItem && clearable">
          <base-icon-btn
            icon="mdi-close"
            class="ms-2"
            density="compact"
            @click.stop="clearSelection"
          />
        </template>
      </v-chip>
    </template>
    <template #default="{ isActive }">
      <menu-wrapper v-model="model" :items :open="isActive" selectable />
    </template>
  </v-menu>
</template>
