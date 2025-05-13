<script setup lang="ts">
import type { ContextMenuItem } from './types';
import { type Instance } from 'tippy.js';

import _ from 'lodash';

import BaseAvatar from '../BaseAvatar.vue';

const selectedItems = defineModel<unknown | unknown[] | null>({
  default: null,
});

const { item, tippy, selectable, multiple, modelValue } = defineProps<{
  item: ContextMenuItem;
  tippy?: Ref<Instance | null>;
  selectable?: boolean;
  multiple?: boolean;
  modelValue?: unknown | unknown[];
}>();

const isSelected = computed(() => {
  if (!selectable) return false;
  if (multiple) {
    return Array.isArray(modelValue) && modelValue.includes(item.value);
  } else {
    return _.isEqual(modelValue, item.value);
  }
});

function handleItemClick(item: ContextMenuItem) {
  if (selectable) {
    let newValue: unknown | unknown[];

    if (multiple) {
      const current = Array.isArray(modelValue) ? modelValue : [];
      newValue = current.includes(item.value)
        ? current.filter((v) => v !== item.value)
        : [...current, item.value];
    } else {
      newValue = modelValue === item.value ? null : item.value;
    }

    selectedItems.value = newValue;
  } else {
    item.action?.();
  }

  if (tippy?.value && !(selectable && multiple)) {
    tippy.value.hide();
  }
}
</script>

<template>
  <v-list-item
    @click="handleItemClick(item)"
    height="30"
    class="py-0 user-select-none"
    min-height="30"
    tabindex="-1"
  >
    <template #prepend v-if="item.icon || item.avatar">
      <template v-if="item.avatar">
        <base-avatar
          :text="item.title"
          :photo="item.photo"
          class="me-1"
          :size="20"
        />
      </template>
      <template v-else>
        <v-icon :icon="item.icon" :color="item.color" size="12" />
      </template>
    </template>
    <v-list-item-title>{{ item.title }}</v-list-item-title>
    <template #append>
      <v-icon v-if="isSelected" icon="mdi-check" size="12" />
      <template v-if="item.shortcut">
        <div class="d-flex align-center ga-1">
          <template v-for="(key, index) in item.shortcut" :key="index">
            <v-kbd class="text-xs elevation-0 bg-accent">
              {{ key }}
            </v-kbd>
          </template>
        </div>
      </template>
    </template>
  </v-list-item>
</template>
