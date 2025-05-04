<script setup lang="ts">
import { useLogo } from '@/composables/useLogo';
import { useSettings } from '@/composables/useSettings';

import SettingsSection from '@/components/common/settings/SettingsSection.vue';

definePage({
  meta: {
    requiresAuth: true,
    hideNavigationDrawer: true,
  },
});

const router = useRouter();
const route = useRoute();

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
  // Get the path after /settings/
  const pathParts = route.path.split('/');
  if (pathParts.length < 4 || !pathParts[3]) {
    // No subroute after type
    return null;
  }
  // Find the section by type
  return allSettings.find((setting) => setting.type === pathParts[2]);
});

function handleBackClick() {
  router.back();
}
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
      <settings-section title="Cards" :settings="cardSettings" />
      <settings-section title="Preferences" :settings="themeSettings" />
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

    <v-toolbar
      v-if="activeSection"
      color="surface"
      height="40"
      @click="handleBackClick"
    >
      <v-btn variant="text" density="compact" class="me-2">
        <v-icon icon="mdi-chevron-left" start />
        <span class="text-caption text-color-subtitle">
          {{ activeSection.title }}
        </span>
      </v-btn>
    </v-toolbar>

    <v-row justify="center" class="fill-height">
      <v-col cols="12" md="8" class="pt-md-16">
        <v-card class="pa-4" max-width="100%">
          <slot />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
