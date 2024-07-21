<script setup lang="ts">
import { DIALOGS } from '@/components/common/dialogs/types';
import UserListItem from '@/components/common/navigation/UserListItem.vue';
import type { NavigationMenuItem } from '@/components/common/navigation/types';
import NavigationRecent from '@/components/project-management/navigation/NavigationRecent.vue';
import NavigationWorkspace from '@/components/project-management/navigation/NavigationWorkspace.vue';
import NavigationWorkspaceSelector from '@/components/project-management/navigation/NavigationWorkspaceSelector.vue';
import { useHideNavigationDrawer } from '@/composables/useHideNavigationDrawer';
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import { useDialogStore } from '@/stores/dialog';

const dialog = useDialogStore();
const { navigationDrawer } = useHideNavigationDrawer();
const authStore = useAuthStore();
const { logout, isAuthenticated } = authStore;
const logo = useLogo();

const navigationMenuItems = ref<NavigationMenuItem[]>([
  //   {
  //     icon: 'mdi-home',
  //     title: 'Home',
  //     route: { name: 'Home' },
  //     activeOnExactMatch: true,
  //   },
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

function openSettingsDialog() {
  dialog.openDialog({
    dialog: DIALOGS.SETTINGS,
    options: {
      fullscreen: true,
    },
  });
}
</script>

<template>
  <v-app>
    <v-app-bar
      v-if="$vuetify.display.mdAndDown"
      color="accent"
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

    <v-navigation-drawer app v-model="navigationDrawer" color="background">
      <v-img
        :src="logo.getLogoUrlByTheme()"
        width="125"
        class="ma-2 mt-4 hidden-md-and-down"
      />
      <v-divider class="hidden-md-and-down" />
      <div v-if="isAuthenticated()">
        <navigation-workspace-selector />
        <navigation-recent />
      </div>

      <!-- Sidebar content -->
      <v-list v-if="navigationMenuItems.length > 0">
        <v-list-item
          v-for="navigationItem in navigationMenuItems"
          :key="navigationItem.title"
          :to="navigationItem.route"
          @click="navigationItem.onClick"
          :exact="navigationItem.activeOnExactMatch"
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
        <v-list :slim="false">
          <v-menu v-if="isAuthenticated()" :close-on-content-click="false">
            <template #activator="{ props }">
              <user-list-item v-bind="props" avatar-size="small">
                <template #append>
                  <v-icon icon="mdi-dots-vertical" size="small" />
                </template>
              </user-list-item>
            </template>
            <v-card class="border-thin ms-n2">
              <v-list>
                <v-list-item @click="openSettingsDialog">
                  <template #prepend>
                    <v-icon icon="mdi-cog" />
                  </template>
                  <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>
                <v-list-item @click="logout()">
                  <template #prepend>
                    <v-icon icon="mdi-logout" />
                  </template>
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
          <v-list-item :to="'/login'" v-else>
            <template #prepend>
              <v-icon icon="mdi-login" />
            </template>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
