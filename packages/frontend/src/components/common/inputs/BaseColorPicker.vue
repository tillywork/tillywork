<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import { useTheme } from 'vuetify';
import colors from 'vuetify/util/colors';

const colorModel = defineModel<string>();
defineProps<{
  label?: string;
  rules?: ((v: any) => true | string)[];
  icon?: boolean;
  hideDetails?: boolean;
}>();

const menu = ref(false);

const theme = useTheme();
const themeStore = useThemeStore();

const swatches = computed(() =>
  Object.values(colors).map((color) => [
    color.base ??
      // - `shades`, we replace it with black or white.
      // NOTE: Corresponds to `default`, although it doesn't get selected when `colorModel`
      // is set to `default`
      (themeStore.theme === 'dark' ? '#FFFFFF' : '#000000'),
  ])
);

function closePickerMenu() {
  menu.value = false;
}

watch(
  colorModel,
  (v) => {
    if (v && !v.startsWith('#')) {
      // If default, then the color picker has no value
      if (v === 'default') {
        return;
      }

      const themeColor = theme.current.value.colors[v];

      if (themeColor) {
        colorModel.value = themeColor;
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false">
    <template #activator="{ props }">
      <template v-if="icon">
        <base-icon-btn
          v-bind="props"
          icon="mdi-circle"
          size="default"
          density="compact"
          :color="colorModel"
        />
      </template>
      <template v-else>
        <v-text-field
          v-model="colorModel"
          v-bind="props"
          :label="label ?? 'Color'"
          :rules
          :hide-details="hideDetails"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-circle-slice-8" :color="colorModel" />
          </template>
        </v-text-field>
      </template>
    </template>
    <v-color-picker
      v-model="colorModel"
      rounded
      mode="hexa"
      show-swatches
      :swatches="swatches"
      position="relative"
      v-click-outside="closePickerMenu"
      hide-inputs
    />
  </v-menu>
</template>
