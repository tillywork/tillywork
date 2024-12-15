<script setup lang="ts">
export type DropdownOption = {
  title: string;
  value: string;
  color?: string;
  icon?: string;
};

const model = defineModel<string>();

const {
  items,
  label = 'Select item',
  icon,
  clearable,
  readonly,
} = defineProps<{
  items: DropdownOption[];
  label?: string;
  icon?: string;
  clearable?: boolean;
  readonly?: boolean;
}>();

const selectedItem = computed(() =>
  items.find((option) => option.value === model.value)
);

function handleSelectItem(item: string) {
  model.value = item;
}

function clearSelection() {
  model.value = undefined;
}
</script>

<template>
  <v-menu :disabled="readonly">
    <template #activator="{ props }">
      <v-chip
        v-bind="readonly ? undefined : props"
        :color="selectedItem?.color"
        density="comfortable"
        class="text-caption"
        rounded="pill"
        variant="tonal"
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
    <v-card>
      <v-list>
        <template v-for="option in items" :key="option.value">
          <v-list-item
            @click="handleSelectItem(option.value)"
            :active="selectedItem?.value === option.value"
          >
            <template #prepend v-if="option.icon">
              <v-icon :icon="option.icon" :color="option.color" />
            </template>
            <v-list-item-title>
              {{ option.title }}
            </v-list-item-title>
            <template #append>
              <v-icon
                v-if="selectedItem?.value === option.value"
                icon="mdi-check"
                size="12"
              />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
