<script setup lang="ts">
import type { FieldItem } from '@/components/project-management/fields/types';

const selected = defineModel<string[]>({
  default: [],
});

const selectedItems = computed(() =>
  selected.value?.map((label) =>
    props.items?.find((item) => item.item === label)
  )
);

const searchLabels = ref<string>();
const searchedLabels = computed(() => {
  if (searchLabels.value) {
    return props.items?.filter((item) =>
      item.item
        .toLocaleLowerCase()
        .includes(searchLabels.value!.toLocaleLowerCase())
    );
  }

  return props.items;
});

const props = defineProps<{
  items?: FieldItem[];
  placeholder?: string;
  multiple?: boolean;
  icon?: string;
  textField?: boolean;
  variant?:
    | 'outlined'
    | 'plain'
    | 'underlined'
    | 'filled'
    | 'solo'
    | 'solo-inverted'
    | 'solo-filled';
}>();

function isItemSelected(item: FieldItem) {
  return !!selected.value?.find((label) => item.item === label);
}

function toggleItemSelection(item: FieldItem) {
  if (props.multiple) {
    if (!isItemSelected(item)) {
      selected.value = [...selected.value, item.item];
    } else {
      const index = selected.value.findIndex((label) => label === item.item);

      selected.value = [
        ...selected.value.slice(0, index),
        ...selected.value.slice(index + 1),
      ];
    }
  } else {
    if (!isItemSelected(item)) {
      selected.value = [item.item];
    } else {
      selected.value = [];
    }
  }
}
</script>

<template>
  <template v-if="textField">
    <v-autocomplete
      v-model="selected"
      :items
      item-title="item"
      item-value="item"
      :variant
      hide-details
      :placeholder
      :multiple
      :prepend-inner-icon="icon"
      autocomplete="off"
      chips
      auto-select-first
    >
      <template #chip="{ item, props }">
        <v-chip
          v-bind="props"
          :color="item.raw.color"
          variant="tonal"
          rounded="xl"
          class="text-body-3"
        />
      </template>
    </v-autocomplete>
  </template>
  <template v-else>
    <v-menu
      :close-on-content-click="false"
      @update:model-value="searchLabels = ''"
    >
      <template #activator="{ props }">
        <div v-bind="props" class="d-flex ga-1">
          <template v-if="selectedItems.length">
            <template v-for="item in selectedItems" :key="item.item">
              <v-chip
                :color="item?.color"
                variant="tonal"
                link
                rounded="xl"
                class="text-body-3"
              >
                {{ item?.item }}
              </v-chip>
            </template>
          </template>
          <template v-else>
            <base-icon-btn :icon />
          </template>
        </div>
      </template>
      <v-card>
        <v-text-field
          v-model="searchLabels"
          placeholder="Search.."
          autofocus
          hide-details
          clearable
          autocomplete="off"
          variant="filled"
        />
        <v-list>
          <template v-for="item in searchedLabels" :key="item.item">
            <v-list-item
              :active="isItemSelected(item)"
              @click="toggleItemSelection(item)"
            >
              <v-chip
                :color="item.color"
                variant="tonal"
                rounded="xl"
                class="text-body-3"
              >
                {{ item.item }}
              </v-chip>
              <template #append>
                <v-icon
                  icon="mdi-check"
                  size="12"
                  v-if="isItemSelected(item)"
                />
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-menu>
  </template>
</template>
