<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" :rail="drawerRail" permanent>
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

    <v-app-bar app class="pr-4">
      <v-btn icon @click="toggleDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title>FalconDrive</v-toolbar-title>
      <v-spacer />
      <ThemeSwitch />
    </v-app-bar>

    <v-main>
      <v-container class="pa-6">
        <router-view />
      </v-container>

      <SnackbarWrapper />
      <!-- TODO: Add dialog component -->
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import ThemeSwitch from '@/modules/common/ThemeSwitch.vue';
import { useTheme } from '@/composables/useTheme';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { useAuth } from '@/composables/useAuth';
import SnackbarWrapper from '@/modules/common/SnackbarWrapper.vue';

export default defineComponent({
  components: {
    ThemeSwitch,
    SnackbarWrapper,
  },
  setup() {
    // Navigation drawer
    const drawer = ref(true);
    const drawerRail = ref(true);
    const drawerPermanent = ref(true);

    const { user, logout, isAuthenticated, selectedProjectId } = useAuth();

    /*
     * This handles setting the user's theme mode (dark or light)
     * and setting it on Vuetify settings
     * Default: dark
     */
    const { theme } = useTheme();
    const appTheme = useVuetifyTheme();
    appTheme.global.name.value = theme;

    const toggleDrawer = () => {
      drawerRail.value = !drawerRail.value;
    };

    return {
      drawer,
      drawerRail,
      user,
      logout,
      isAuthenticated,
      toggleDrawer,
      drawerPermanent,
      selectedProjectId,
    };
  },
});
</script>
