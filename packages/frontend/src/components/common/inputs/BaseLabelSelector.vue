<script setup lang="ts">
import type { FieldItem } from '@/components/project-management/fields/types';

interface Props {
  items?: FieldItem[];
  placeholder?: string;
  multiple?: boolean;
  icon?: string;
  textField?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});
const emit = defineEmits(['label:update:items']);

const labelValue = defineModel<string | string[]>({ default: [] });

const itemsCopy = ref<FieldItem[]>(props.items);

watch(labelValue, (v) => {
  const items = props.items.map((item) => item.item);
  if (Array.isArray(v)) {
    if (v.some((label) => !items.includes(label))) {
      emit('label:update:items', itemsCopy.value);
    }
  } else {
    if (!items.includes(v)) {
      emit('label:update:items', itemsCopy.value);
    }
  }
});

function handleSearch(search: string) {
  if (search) {
    itemsCopy.value = appendItemsWithSearch(props.items, search);
  }
}

function appendItemsWithSearch(items: FieldItem[], search: string) {
  const item = items.find((item) => item.item === search);

  if (item) {
    return items;
  } else {
    return [{ item: search, color: 'default' }, ...items];
  }
}

// !TextField
const searchText = ref<string>('');
const searchResult = computed(() => {
  handleSearch(searchText.value);

  if (searchText.value) {
    return appendItemsWithSearch(itemsCopy.value, searchText.value);
  } else {
    return itemsCopy.value;
  }
});

const selectedItems = computed(() => {
  if (Array.isArray(labelValue.value)) {
    return labelValue.value
      .map((label) => itemsCopy.value.find((item) => item.item === label))
      .filter(Boolean) as FieldItem[];
  } else {
    return [
      itemsCopy.value.find((item) => item.item === labelValue.value),
    ].filter(Boolean) as FieldItem[];
  }
});

function toggleItemSelection(item: FieldItem) {
  if (props.multiple) {
    if (selectedItems.value.map((item) => item.item).includes(item.item)) {
      const index = (labelValue.value as string[]).findIndex(
        (label) => label === item.item
      );
      labelValue.value = [
        ...labelValue.value.slice(0, index),
        ...labelValue.value.slice(index + 1),
      ];
    } else {
      labelValue.value = [...labelValue.value, item.item];
    }
  } else {
    labelValue.value = item.item;
  }
}
</script>

<template>
  <template v-if="textField">
    <v-autocomplete
      v-model="labelValue"
      :items="itemsCopy"
      item-title="item"
      item-value="item"
      hide-details
      :placeholder
      :multiple
      :prepend-inner-icon="icon"
      autocomplete="off"
      chips
      auto-select-first
      @update:search="handleSearch"
    >
      <template #chip="{ item, props }">
        <v-chip v-bind="props" :color="item.raw.color" variant="flat" />
      </template>
    </v-autocomplete>
  </template>
  <template v-else>
    <v-menu
      :close-on-content-click="false"
      @update:model-value="searchText = ''"
    >
      <template #activator="{ props }">
        <div v-bind="props" class="d-flex ga-1">
          <template v-if="selectedItems.length">
            <template v-for="item in selectedItems" :key="item.item">
              <v-chip :color="item.color" variant="flat" link size="small">
                {{ item.item }}
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
          v-model="searchText"
          placeholder="Search.."
          autofocus
          hide-details
          clearable
          autocomplete="off"
        />
        <v-list>
          <template v-for="item in searchResult" :key="item.item">
            <v-list-item
              :active="selectedItems.includes(item)"
              @click="toggleItemSelection(item)"
            >
              <v-chip :color="item.color" variant="flat" size="small">
                {{ item.item }}
              </v-chip>
              <template #append>
                <v-icon
                  icon="mdi-check"
                  size="12"
                  v-if="selectedItems.includes(item)"
                />
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-menu>
  </template>
</template>
