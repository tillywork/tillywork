<script setup lang="ts">
import { useTheme } from 'vuetify';

const colorModel = defineModel<string>();
defineProps<{
  label?: string;
  rules?: ((v: any) => true | string)[];
}>();

const menu = ref(false);

const theme = useTheme();

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
      <v-text-field
        v-model="colorModel"
        v-bind="props"
        :label="label ?? 'Color'"
        :rules
      >
        <template #prepend-inner>
          <v-icon icon="mdi-circle-slice-8" :color="colorModel" />
        </template>
      </v-text-field>
    </template>
    <v-color-picker
      v-model="colorModel"
      rounded
      mode="hexa"
      v-click-outside="closePickerMenu"
    />
  </v-menu>
</template>
