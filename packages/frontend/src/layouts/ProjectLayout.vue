<script setup lang="ts">
import ThemeSwitch from '@/components/common/ThemeSwitch.vue';
import { useAuthStore } from '@/stores/auth';
import SnackbarWrapper from '@/components/common/SnackbarWrapper.vue';
import { ref } from 'vue';
import ToolbarSearch from '@/components/common/navigation/ToolbarSearch.vue';
import NavigationWorkspace from '@/components/project-management/navigation/NavigationWorkspace.vue';
import type { NavigationMenuItem } from '@/components/common/navigation/types';
import NavigationWorkspaceSelector from '@/components/project-management/navigation/NavigationWorkspaceSelector.vue';

const navigationDrawer = ref(true);
const { logout, isAuthenticated } = useAuthStore();

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
</script>

<template>
  <v-app>
    <v-navigation-drawer app v-model="navigationDrawer">
      <navigation-workspace-selector />

      <!-- Sidebar content -->
      <v-list
        density="compact"
        nav
        :lines="false"
        v-if="navigationMenuItems.length > 0"
      >
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
    <v-app-bar app class="pr-4 border-b" height="56" density="comfortable">
      <!-- <v-app-bar-nav-icon
        density="comfortable"
        @click.stop="navigationDrawer = !navigationDrawer"
      ></v-app-bar-nav-icon> -->

      <v-app-bar-title></v-app-bar-title>
      <toolbar-search />
      <v-spacer />
      <theme-switch />
    </v-app-bar>

    <v-main>
      <router-view />

      <snackbar-wrapper />
    </v-main>
  </v-app>
</template>
