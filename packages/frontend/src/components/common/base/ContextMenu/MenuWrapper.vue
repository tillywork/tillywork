<script setup lang="ts">
import type { MaybeRef } from 'vue';
import MenuItem from './MenuItem.vue';

import type { ContextMenuItem } from './types';
import { type Instance } from 'tippy.js';

import SmallTextInput from '../../inputs/SmallTextInput.vue';
import stringUtils from '@/utils/string';
import { useListKeyboardNavigation } from '@/composables/useListKeyboardNavigation';

const selectedItems = defineModel<unknown | unknown[] | null>({
  default: null,
});

const {
  items = [],
  tippy,
  onUpdateModelValue,
} = defineProps<{
  items?: MaybeRef<ContextMenuItem[]>;
  tippy?: Instance;
  selectable?: boolean;
  multiple?: boolean;
  onUpdateModelValue?: (v: unknown | unknown[]) => void;
}>();

const optionSearch = ref('');

const { activeIndex, containerRef } = useListKeyboardNavigation({});

const filteredItems = computed<ContextMenuItem[]>(() => {
  if (optionSearch.value == '') {
    return toValue(items);
  }

  const filteredItems: ContextMenuItem[] =
    toValue(items).filter((item) =>
      stringUtils.fuzzySearch(optionSearch.value, item.title)
    ) ?? [];

  return filteredItems;
});

const activeItem = computed(() => filteredItems.value[activeIndex.value]);

watch(selectedItems, (v) => onUpdateModelValue?.(v));
</script>

<template>
  <v-card min-width="225" border="thin" elevation="1" color="dialog">
    <div class="pa-2 pb-1">
      <small-text-input
        v-model="optionSearch"
        label="Search.."
        autofocus
        rounded="md"
      />
    </div>
    <v-list
      ref="containerRef"
      nav
      class="pa-1"
      bg-color="transparent"
      :selected="[activeItem?.value]"
    >
      <template v-for="item in filteredItems" :key="item.title">
        <menu-item
          v-model="selectedItems"
          :item="item"
          :tippy
          :selectable
          :multiple
          :active="item.value === activeItem?.value"
        />
      </template>
    </v-list>
  </v-card>
</template>
