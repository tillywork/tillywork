<script setup lang="ts">
import type { MaybeRef } from 'vue';
import MenuItem from './MenuItem.vue';

import { type Instance } from 'tippy.js';

import { useListKeyboardNavigation } from '@/composables/useListKeyboardNavigation';

import type { ContextMenuItem } from './types';

import stringUtils from '@/utils/string';
import _ from 'lodash';

import SmallTextInput from '../../inputs/SmallTextInput.vue';

const selectedItems = defineModel<unknown | unknown[] | null>({
  default: null,
});

const {
  items = [],
  open = false,
  tippy,
  onUpdateModelValue,
} = defineProps<{
  items?: MaybeRef<ContextMenuItem[]>;
  tippy?: Ref<Instance>;
  selectable?: boolean;
  multiple?: boolean;
  onUpdateModelValue?: (v: unknown | unknown[]) => void;
  open?: MaybeRef<boolean>;
}>();

const optionSearch = ref('');

const isMenuOpen = computed(() => toValue(open));

const { activeIndex, containerRef } = useListKeyboardNavigation({
  enabled: isMenuOpen,
});

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
      <template v-if="filteredItems.length">
        <template v-for="item in filteredItems" :key="item.title">
          <menu-item
            v-model="selectedItems"
            :item="item"
            :tippy
            :selectable
            :multiple
            :active="_.isEqual(item, activeItem)"
          />
        </template>
      </template>
      <template v-else>
        <v-list-item height="30" min-height="30">
          <template #prepend>
            <v-icon color="warning" icon="mdi-information-outline" />
          </template>
          <v-list-item-title class="text-xs text-color-subtitle">
            No items found
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>
