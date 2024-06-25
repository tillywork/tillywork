<script setup lang="ts">
import Common from './common';

const icon = defineModel<string>();

const tab = ref();
const searchIcon = ref();
const menu = ref(false);
const attrs = useAttrs();

const iconDictionary = computed(() => {
  return {
    common: Common,
  };
});

function handleSelectIcon(selectedIcon: string) {
  icon.value = selectedIcon;
  menu.value = false;
}

watch(
  icon,
  (v) => {
    if (!v) {
      handleSelectIcon('mdi-tag');
    }
  },
  { immediate: true }
);
</script>

<template>
  <base-icon-btn id="activator" v-bind="attrs" :icon />
  <v-menu v-model="menu" :close-on-content-click="false" activator="#activator">
    <v-card width="296" height="400">
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
        <v-tab slim>
          <v-icon icon="mdi-apps" />
        </v-tab>
      </v-tabs>
      <v-divider class="mx-4" />
      <v-tabs-items v-model="tab">
        <v-tab-item
          :key="idx"
          v-for="(v, k, idx) in iconDictionary"
          class="overflow-auto py-2"
        >
          <v-card height="316" border="none" class="overflow-auto">
            <v-card-text class="pa-2 d-flex flex-wrap ga-1">
              <template v-for="(i, index) in v" :key="index">
                <v-btn
                  icon
                  color=""
                  :style="{ backgroundColor: icon === i ? 'accent' : '' }"
                  density="comfortable"
                  @click="handleSelectIcon(i)"
                  :active="icon === i"
                >
                  <v-icon>{{ i }}</v-icon>
                </v-btn>
              </template>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-menu>
</template>
