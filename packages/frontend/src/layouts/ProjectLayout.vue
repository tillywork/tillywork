<script setup lang="ts">
import ThemeSwitch from '@/components/common/theme/ThemeSwitch.vue';
import { useAuth } from '@/composables/useAuth';
import SnackbarWrapper from '@/components/common/SnackbarWrapper.vue';
import { ref } from 'vue';
import { type RouteLocationRaw } from 'vue-router';
import ToolbarSearch from '@/components/common/inputs/ToolbarSearch.vue';
import NavigationWorkspace from '@/components/project-management/navigation/NavigationWorkspace.vue';

export interface NavigationMenuItem {
  title: string;
  icon?: string;
  route?: RouteLocationRaw;
  activeOnExactMatch?: boolean;
  onClick?: () => unknown;
}

const navigationDrawer = ref(true);
const { logout, isAuthenticated } = useAuth();

const navigationMenuItems = ref<NavigationMenuItem[]>([
  {
    icon: 'mdi-home',
    title: 'Home',
    route: { name: 'Home' },
    activeOnExactMatch: true,
  },
]);

if (isAuthenticated()) {
  // Initialize with default items
  navigationMenuItems.value = [
    {
      icon: 'mdi-home',
      title: 'Home',
      route: { name: 'PMHome' },
      activeOnExactMatch: true,
    },
  ];
}
</script>

<template>
  <v-app>
    <v-app-bar app class="pr-4 border-b" height="56" prominent density="comfortable">
      <v-app-bar-nav-icon density="comfortable" @click.stop="navigationDrawer = !navigationDrawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Hello</v-app-bar-title>
      <toolbar-search />
      <v-spacer />
      <theme-switch />
    </v-app-bar>

    <v-navigation-drawer v-model="navigationDrawer">
      <!-- Sidebar content -->
      <v-list density="compact" nav>
        <v-list-item
          v-for="navigationItem in navigationMenuItems"
          :key="navigationItem.title"
          :to="navigationItem.route"
          @click="navigationItem.onClick"
          :exact="navigationItem.activeOnExactMatch"
          rounded="lg"
        >
          <template #prepend v-if="navigationItem.icon">
            <v-icon :icon="navigationItem.icon" />
          </template>
          <v-list-item-title>{{ navigationItem.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- Current Workspace Information -->
      <navigation-workspace />

      <template v-slot:append>
        <v-list density="compact" nav>
          <v-list-item @click="logout" rounded="lg" v-if="isAuthenticated()">
            <template #prepend>
              <v-icon icon="mdi-logout" />
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
          <v-list-item :to="{ name: 'Login' }" rounded="lg" v-else>
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

      <snackbar-wrapper />
    </v-main>
  </v-app>
</template>
