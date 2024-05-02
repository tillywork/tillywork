<script setup lang="ts">
import ThemeSwitch from '@/components/common/ThemeSwitch.vue';
import { useAuthStore } from '@/stores/auth';
import SnackbarWrapper from '@/components/common/SnackbarWrapper.vue';
import { ref } from 'vue';
import ToolbarSearch from '@/components/common/navigation/ToolbarSearch.vue';
import { storeToRefs } from 'pinia';
import type { NavigationMenuItem } from '@/components/common/navigation/types';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { isAuthenticated, logout } = authStore;

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
      route: { name: 'Home' },
      activeOnExactMatch: true,
    },
  ];

  // Show only if a project is selected
  // if (selectedProjectId) {
  //   navigationMenuItems.value.push({
  //     icon: 'mdi-clipboard-list',
  //     title: 'Tasks',
  //     route: { name: 'Tasks', params: { projectId: selectedProjectId } },
  //   });
  //   navigationMenuItems.value.push({
  //     icon: 'mdi-account-group',
  //     title: 'Contacts',
  //     route: { name: 'Contacts', params: { projectId: selectedProjectId } },
  //   });
  //   navigationMenuItems.value.push({
  //     icon: 'mdi-factory',
  //     title: 'Organizations',
  //     route: {
  //       name: 'Organizations',
  //       params: { projectId: selectedProjectId },
  //     },
  //   });
  // }
}

function printUserFullName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`;
}

function getUserAvatar(user: { photo: string }) {
  if (user.photo) {
    return user.photo;
  }

  return 'https://randomuser.me/api/portraits/women/85.jpg';
}
</script>

<template>
  <v-app>
    <v-navigation-drawer app rail expand-on-hover color="background">
      <!-- Sidebar content -->
      <v-list>
        <v-list-item>
          <template #prepend>
            <v-avatar :image="getUserAvatar(user)" />
          </template>
          <v-list-item-title>{{ printUserFullName(user) }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

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

        <v-divider />

        <!-- Sales Menu -->
        <!-- <template v-if="isAuthenticated() && selectedProjectId">
          <v-list-subheader class="my-2 ml-6">Sales</v-list-subheader>
          <v-list-item
            v-for="navigationItem in salesMenuItems"
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
        </template> -->
      </v-list>

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

    <v-app-bar app class="pr-4" height="56" color="background">
      <v-toolbar-title>TillyWork</v-toolbar-title>
      <toolbar-search />
      <v-spacer />
      <theme-switch />
    </v-app-bar>

    <v-main>
      <router-view />

      <SnackbarWrapper />
    </v-main>
  </v-app>
</template>
