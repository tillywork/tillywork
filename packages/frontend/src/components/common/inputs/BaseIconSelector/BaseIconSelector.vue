<script setup lang="ts">
import Icons from './icons';

import BaseColorPicker from '../BaseColorPicker.vue';

import stringUtils from '@/utils/string';

import type { VCard } from 'vuetify/components';

export type IconSelection = {
  name: string;
  icon: string;
};

defineProps<{
  withColor?: boolean;
}>();

const icon = defineModel<string>();
const iconColor = defineModel<string>('color');

const searchIcon = ref();
const menu = ref(false);
const attrs = useAttrs();

const iconDictionary = computed(() => {
  return {
    icons: Icons.filter(
      (icon) =>
        stringUtils.fuzzySearch(searchIcon.value, icon.icon) ||
        stringUtils.fuzzySearch(searchIcon.value, icon.name)
    ),
  };
});

function handleSelectIcon(selectedIcon: IconSelection) {
  icon.value = selectedIcon.icon;
}

watch(
  icon,
  (v) => {
    if (!v) {
      handleSelectIcon({
        icon: 'mdi-tag',
        name: 'Tag',
      });
    }
  },
  { immediate: true }
);

// Custom virtualized grid logic
const gridContainer = ref<VCard | null>();
const scrollTop = ref(0);
const visibleItems = computed(() => {
  if (!gridContainer.value) return [];

  const containerHeight = gridContainer.value.$el.clientHeight;
  const scrollOffset = scrollTop.value;

  // Calculate the start and end indices of visible rows
  const startRow = Math.floor(scrollOffset / ROW_HEIGHT);
  const endRow = Math.ceil((scrollOffset + containerHeight) / ROW_HEIGHT);

  // Calculate the start and end indices of visible items
  const startIndex = startRow * COLUMNS;
  const endIndex = endRow * COLUMNS;

  // Update the visible items
  const visibleItems = iconDictionary.value.icons.slice(startIndex, endIndex);
  return visibleItems;
});
const iconGridHeight = computed(
  () =>
    `${Math.ceil(iconDictionary.value.icons.length / COLUMNS) * ROW_HEIGHT}px`
);

// Item size and grid configuration
const ITEM_SIZE = 36; // Height of each item
const COLUMNS = 8; // Number of columns
const ROW_HEIGHT = ITEM_SIZE + 8; // Height of each row (including gap)

const handleScroll = () => {
  if (!gridContainer.value) return;
  scrollTop.value = gridContainer.value.$el.scrollTop;
};

const getItemTop = (item: IconSelection) => {
  const index = iconDictionary.value.icons.indexOf(item);
  return `${Math.floor(index / COLUMNS) * ROW_HEIGHT}px`;
};

const getItemLeft = (item: IconSelection) => {
  const index = iconDictionary.value.icons.indexOf(item);
  return `${(index % COLUMNS) * (100 / COLUMNS)}%`;
};

watch(menu, (isOpen) => {
  nextTick(() => {
    if (isOpen && gridContainer.value) {
      gridContainer.value.$el.addEventListener('scroll', handleScroll);
      handleScroll();
    } else if (gridContainer.value) {
      gridContainer.value.$el.removeEventListener('scroll', handleScroll);
    }
  });
});

onUnmounted(() => {
  if (gridContainer.value) {
    gridContainer.value.$el.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <base-icon-btn id="activator" v-bind="attrs" :icon :color="iconColor" />
  <v-menu v-model="menu" :close-on-content-click="false" activator="#activator">
    <v-card width="296">
      <div class="py-2 px-4 border-b-thin">
        <span class="text-body-3 me-3">Color</span>
        <base-color-picker
          v-if="withColor"
          v-model="iconColor"
          hide-details
          icon
        />
      </div>
      <v-text-field
        v-model="searchIcon"
        hide-details
        placeholder="Search..."
        autofocus
        autocomplete="off"
        clearable
        variant="filled"
        rounded="0"
      />
      <v-card
        height="222"
        border="none"
        class="overflow-auto pa-2"
        ref="gridContainer"
      >
        <div
          class="icon-grid"
          :style="{
            height: iconGridHeight,
          }"
        >
          <div
            v-for="item in visibleItems"
            :key="item.icon"
            class="icon-item"
            :style="{
              top: getItemTop(item),
              left: getItemLeft(item),
            }"
          >
            <v-btn
              icon
              density="comfortable"
              @click="handleSelectIcon(item)"
              :active="icon === item.icon"
              color="default"
              size="30"
              v-tooltip:bottom="item.name"
            >
              <v-icon
                :color="icon === item.icon ? iconColor : undefined"
                size="small"
                >{{ item.icon }}</v-icon
              >
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-card>
  </v-menu>
</template>

<style lang="scss" scoped>
.icon-grid {
  position: relative;

  .icon-item {
    position: absolute;
    width: calc(100% / 8); /* Equal width for each column */
    height: 36px; /* Height of each item */
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
