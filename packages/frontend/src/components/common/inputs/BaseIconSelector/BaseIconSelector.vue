<script setup lang="ts">
import Icons from './icons';
import BaseColorPicker from '../BaseColorPicker.vue';
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

const tab = ref();
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
      <v-text-field
        v-model="searchIcon"
        hide-details
        placeholder="Search..."
        autofocus
        autocomplete="off"
        clearable
      />
      <v-tabs
        v-model="tab"
        class="justify-center d-flex"
        height="40"
        center-active
        density="compact"
      >
        <v-tab class="text-capitalize text-body-3"> Icons </v-tab>
      </v-tabs>
      <v-divider class="mx-4" />
      <v-tabs-items v-model="tab">
        <v-tab-item
          :key="idx"
          v-for="(v, k, idx) in iconDictionary"
          class="overflow-auto py-2"
        >
          <div class="py-2 px-4 border-b-thin">
            <span class="text-body-3 me-3">Color</span>
            <base-color-picker
              v-if="withColor"
              v-model="iconColor"
              hide-details
              icon
            />
          </div>
          <v-card height="316" border="none" class="overflow-auto">
            <v-card-text class="pa-2 d-flex flex-wrap ga-1">
              <template v-for="(i, index) in v" :key="index">
                <v-btn
                  icon
                  :style="{ backgroundColor: icon === i.icon ? 'accent' : '' }"
                  density="comfortable"
                  @click="handleSelectIcon(i)"
                  :active="icon === i.icon"
                  color="default"
                  size="30"
                  v-tooltip:bottom="i.name"
                >
                  <v-icon :color="icon === i.icon ? iconColor : undefined">{{
                    i.icon
                  }}</v-icon>
                </v-btn>
              </template>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-menu>
</template>
