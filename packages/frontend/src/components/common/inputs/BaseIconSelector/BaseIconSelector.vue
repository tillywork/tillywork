<script setup lang="ts">
import Icons from './icons';

import BaseColorPicker from '../BaseColorPicker.vue';
import VirtualScroller from '../../base/VirtualScroller.vue';

import stringUtils from '@/utils/string';

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
</script>

<template>
  <base-icon-btn id="activator" v-bind="attrs" :icon :color="iconColor" />
  <v-menu v-model="menu" :close-on-content-click="false" activator="#activator">
    <v-card width="296">
      <div class="py-2 px-4 border-b-thin" v-if="withColor">
        <span class="text-body-3 me-3">Color</span>
        <base-color-picker v-model="iconColor" hide-details icon />
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
      <v-card height="222" border="none" class="overflow-auto pa-2">
        <virtual-scroller
          :items="iconDictionary.icons"
          :columns="8"
          :row-height="44"
          :item-size="36"
        >
          <template #default="{ item }">
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
          </template>
        </virtual-scroller>
      </v-card>
    </v-card>
  </v-menu>
</template>
