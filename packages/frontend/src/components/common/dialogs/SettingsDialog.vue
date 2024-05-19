<script setup lang="ts">
import { useDialog } from '@/composables/useDialog';
import BaseIconBtn from '../base/BaseIconBtn.vue';
import BaseThemeSwitch from '../base/BaseThemeSwitch.vue';

const dialog = useDialog();

const tabs = ref([
  {
    icon: 'mdi-monitor-screenshot',
    text: 'Theme',
    value: 'theme',
  },
]);
</script>

<template>
  <v-card color="accent" class="pa-4">
    <v-card-title class="d-flex">
      Settings
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        size="default"
        @click="dialog.closeDialog"
      />
    </v-card-title>
    <v-card-text class="d-flex flex-row">
      <v-tabs
        direction="vertical"
        color="primary"
        density="compact"
        :items="tabs"
        class="border-e-thin"
        height="40"
        center-active
      >
        <template #tab="{ item }">
          <v-tab
            :prepend-icon="item.icon"
            :text="item.text"
            :value="item.value"
            class="text-none"
          ></v-tab>
        </template>
        <template #item.theme>
          <v-card color="transparent">
            <v-card-text>
              <v-list class="bg-transparent">
                <v-list-item>
                  <base-theme-switch />
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </template>
      </v-tabs>
    </v-card-text>
  </v-card>
</template>
