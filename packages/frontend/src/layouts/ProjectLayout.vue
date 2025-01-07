<script setup lang="ts">
import UserMenu from '@/components/common/navigation/UserMenu.vue';
import type { NavigationMenuItem } from '@/components/common/navigation/types';
import NavigationWorkspace from '@/components/project-management/navigation/NavigationWorkspace.vue';
import NavigationWorkspaceSelector from '@/components/project-management/navigation/NavigationWorkspaceSelector.vue';
import { useHideNavigationDrawer } from '@/composables/useHideNavigationDrawer';
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import CommandPaletteActivator from '@/components/common/navigation/CommandPaletteActivator.vue';

const { hideNavigationDrawer } = useHideNavigationDrawer();
const navigationDrawer = ref(true);
const authStore = useAuthStore();
const { isAuthenticated } = authStore;
const logo = useLogo();

const navigationMenuItems = ref<NavigationMenuItem[]>([
  {
    icon: 'mdi-draw',
    title: 'Whiteboard',
    route: '/whiteboard',
    activeOnExactMatch: true,
  },
]);

if (isAuthenticated()) {
  // Initialize with default items
  //   navigationMenuItems.value = [
  //     {
  //       icon: 'mdi-home',
  //       title: 'Home',
  //       route: { name: 'PMHome' },
  //       activeOnExactMatch: true,
  //     },
  //   ];
}
</script>

<template>
  <v-app>
    <v-app-bar
      v-if="!hideNavigationDrawer && $vuetify.display.mdAndDown"
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

    <v-navigation-drawer
      v-if="!hideNavigationDrawer"
      v-model="navigationDrawer"
      app
    >
      <v-img
        :src="logo.getLogoUrlByTheme()"
        width="125"
        class="ma-2 mt-4 hidden-md-and-down"
      />
      <v-divider class="hidden-md-and-down" />
      <navigation-workspace-selector v-if="isAuthenticated()" />

      <command-palette-activator class="mt-4 ms-3" />

      <!-- Sidebar content -->
      <v-list v-if="navigationMenuItems.length > 0" class="mt-4">
        <v-list-item
          v-for="navigationItem in navigationMenuItems"
          :key="navigationItem.title"
          :to="navigationItem.route"
          @click="navigationItem.onClick"
          :exact="navigationItem.activeOnExactMatch"
          rounded="md"
        >
          <template #prepend v-if="navigationItem.icon">
            <v-icon :icon="navigationItem.icon" />
          </template>
          <v-list-item-title>{{ navigationItem.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Current Workspace Information -->
      <navigation-workspace v-if="isAuthenticated()" />

      <template v-slot:append>
        <user-menu />
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
