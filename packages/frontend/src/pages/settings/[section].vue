<script setup lang="ts">
import { SettingsType } from '@/components/common/settings/types';
import { useLogo } from '@/composables/useLogo';
import { useSettings } from '@/composables/useSettings';
import stringUtils from '@/utils/string';

import SettingsSection from '@/components/common/settings/SettingsSection.vue';

definePage({
  meta: {
    requiresAuth: true,
    hideNavigationDrawer: true,
  },
});

const route = useRoute('/settings/[section]');
const router = useRouter();
const {
  allSettings,
  themeSettings,
  accountSettings,
  workspaceSettings,
  cardSettings,
} = useSettings();
const logo = useLogo();

const navigationDrawer = ref(true);

const activeSection = computed(() => {
  return allSettings.find((setting) => setting.type === route.params.section);
});

onMounted(() => {
  if (!Object.values(SettingsType).includes(route.params.section)) {
    router.replace('/');
  }
});

watch(
  route,
  (v) => {
    if (v)
      document.title = `${stringUtils.snakeToTitleCase(
        route.params.section
      )} - tillywork`;
  },
  { immediate: true }
);
</script>

<template>
  <v-navigation-drawer v-model="navigationDrawer" class="user-select-none">
    <div class="pa-3 pb-0">
      <v-btn
        class="text-none"
        color="default"
        variant="text"
        prepend-icon="mdi-chevron-left"
        to="/"
      >
        Settings
      </v-btn>
    </div>
    <v-list>
      <settings-section title="Account" :settings="accountSettings" />
      <settings-section title="Card" :settings="cardSettings" />
      <settings-section title="Theme" :settings="themeSettings" />
      <settings-section title="Workspace" :settings="workspaceSettings" />
    </v-list>
  </v-navigation-drawer>

  <v-container class="fill-height bg-surface" fluid>
    <v-app-bar
      v-if="$vuetify.display.mdAndDown"
      height="40"
      class="border-b-thin"
    >
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="navigationDrawer = !navigationDrawer"
      />

      <v-toolbar-title>
        <v-img :src="logo.getLogoUrlByTheme()" width="125" />
      </v-toolbar-title>
    </v-app-bar>

    <v-row justify="center" class="fill-height">
      <v-col cols="12" md="8" class="pt-md-16">
        <v-card class="pa-4" max-width="100%">
          <component v-if="activeSection" :is="activeSection.component" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
