<template>
  <v-app>
    <v-navigation-drawer app rail expand-on-hover>
      <!-- Sidebar content -->
      <v-list>
        <v-list-item v-if="user">
          <template #prepend>
            <v-icon icon="mdi-home" />
          </template>
          <v-list-item-title>{{ user.email }}</v-list-item-title>
        </v-list-item>
        <v-list-item to="/">
          <template #prepend>
            <v-icon icon="mdi-home" />
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <!-- Contacts button -->
        <v-list-item :to="{ name: 'Contacts', params: { projectId: selectedProjectId }}" v-if="isAuthenticated() && selectedProjectId">
          <template #prepend>
            <v-icon icon="mdi-account-group" />
          </template>
          <v-list-item-title>Contacts</v-list-item-title>
        </v-list-item>
        <!-- Login button -->
        <v-list-item :to="{ name: 'Login' }" v-if="!isAuthenticated()">
          <template #prepend>
            <v-icon>mdi-login</v-icon>
          </template>
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
        <!-- Logout button -->
        <v-list-item link @click="logout" v-if="isAuthenticated()">
          <template #prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
        <!-- Add more navigational items here -->
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app class="pr-4" :height="48">
      <v-toolbar-title>FalconDrive</v-toolbar-title>
      <v-spacer />
      <ThemeSwitch />
    </v-app-bar>

    <v-main>
      <router-view />

      <SnackbarWrapper />
      <!-- TODO: Add dialog component -->
    </v-main>
  </v-app>
</template>

<script lang="ts">
import ThemeSwitch from '@/modules/common/ThemeSwitch.vue';
import { useTheme } from '@/composables/useTheme';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { useAuth } from '@/composables/useAuth';
import SnackbarWrapper from '@/modules/common/SnackbarWrapper.vue';

export default {
  components: {
    ThemeSwitch,
    SnackbarWrapper,
  },
  setup() {
    const { user, logout, isAuthenticated, selectedProjectId } = useAuth();

    /*
     * This handles setting the user's theme mode (dark or light)
     * and setting it on Vuetify settings
     * Default: dark
     */
    const { theme } = useTheme();
    const appTheme = useVuetifyTheme();
    appTheme.global.name.value = theme;

    return {
      user,
      logout,
      isAuthenticated,
      selectedProjectId,
    };
  },
};
</script>
