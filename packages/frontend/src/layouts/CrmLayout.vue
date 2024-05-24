<script setup lang="ts">
import BaseThemeSwitch from '@/components/common/base/BaseThemeSwitch.vue';
import UserListItem from '@/components/common/navigation/UserListItem.vue';
import { useAuthStore } from '@/stores/auth';
import type { NavigationMenuItem } from '@/components/common/navigation/types';
import { useHideNavigationDrawer } from '@/composables/useHideNavigationDrawer';
import { useLogo } from '@/composables/useLogo';

const authStore = useAuthStore();
const { isAuthenticated, logout } = authStore;
const { navigationDrawer } = useHideNavigationDrawer();
const logo = useLogo();

const navigationMenuItems = ref<NavigationMenuItem[]>([
  {
    icon: 'mdi-home',
    title: 'Home',
    route: '/crm',
    activeOnExactMatch: true,
  },
]);

const salesMenuItems = ref<NavigationMenuItem[]>([
  {
    icon: 'mdi-handshake',
    title: 'Deals',
    route: '/crm/deals',
  },
]);

if (isAuthenticated()) {
  navigationMenuItems.value.push({
    icon: 'mdi-clipboard-list',
    title: 'Tasks',
    route: '/crm/tasks',
  });
  navigationMenuItems.value.push({
    icon: 'mdi-account-group',
    title: 'Contacts',
    route: '/crm/contacts',
  });
  navigationMenuItems.value.push({
    icon: 'mdi-factory',
    title: 'Organizations',
    route: '/crm/organizations',
  });
}
</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-model="navigationDrawer"
      app
      rail
      expand-on-hover
      color="background"
    >
      <!-- User content -->
      <v-list v-if="isAuthenticated()" lines="one" :nav="false" :slim="false">
        <user-list-item />
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav lines="one">
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

        <v-divider />

        <!-- Sales Menu -->
        <template v-if="isAuthenticated()">
          <v-list-subheader class="my-2 ml-6">Sales</v-list-subheader>
          <v-list-item
            v-for="navigationItem in salesMenuItems"
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
        </template>
      </v-list>

      <template v-slot:append>
        <v-list>
          <v-list-item @click="logout()" v-if="isAuthenticated()">
            <template #prepend>
              <v-icon icon="mdi-logout" />
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
          <v-list-item :to="'/login'" v-else>
            <template #prepend>
              <v-icon icon="mdi-login" />
            </template>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar app class="pr-4" density="compact" color="background">
      <v-toolbar-title>
        <v-img :src="logo.getLogoUrlByTheme()" width="125" />
      </v-toolbar-title>
      <v-spacer />
      <base-theme-switch />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
