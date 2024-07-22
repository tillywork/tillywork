<script setup lang="ts">
import UserListItem from '@/components/common/navigation/UserListItem.vue';
import { useAuthStore } from '@/stores/auth';
import type { NavigationMenuItem } from '@/components/common/navigation/types';
import { useHideNavigationDrawer } from '@/composables/useHideNavigationDrawer';
import { useLogo } from '@/composables/useLogo';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '@/components/common/dialogs/types';
import NavigationWorkspaceSelector from '@/components/project-management/navigation/NavigationWorkspaceSelector.vue';

const authStore = useAuthStore();
const { isAuthenticated, logout } = authStore;
const { workspace } = storeToRefs(authStore);
const { hideNavigationDrawer } = useHideNavigationDrawer();
const navigationDrawer = ref(true);
const logo = useLogo();
const dialog = useDialogStore();

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
    <v-app-bar
      v-if="!hideNavigationDrawer && $vuetify.display.mdAndDown"
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

    <v-navigation-drawer
      v-if="!hideNavigationDrawer"
      v-model="navigationDrawer"
      app
      color="background"
    >
      <v-img
        :src="logo.getLogoUrlByTheme()"
        width="125"
        class="ma-2 mt-4 hidden-md-and-down"
      />
      <v-divider class="hidden-md-and-down" />
      <navigation-workspace-selector v-if="isAuthenticated()" />

      <v-list class="mt-2">
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
        <!-- User content -->
        <v-list v-if="isAuthenticated()" :slim="false">
          <v-menu :close-on-content-click="false">
            <template #activator="{ props }">
              <user-list-item v-bind="props" avatar-size="small">
                <template #append>
                  <v-icon icon="mdi-dots-vertical" />
                </template>
              </user-list-item>
            </template>
            <v-card class="border-thin ms-n2">
              <v-list>
                <v-menu>
                  <template #activator="{ props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon icon="mdi-apps" />
                      </template>
                      <v-list-item-title>Apps</v-list-item-title>
                    </v-list-item>
                  </template>
                  <v-card
                    class="d-flex flex-wrap align-center justify-space-evenly py-4"
                    width="275"
                    rounded="lg"
                  >
                    <v-card
                      class="d-flex flex-column align-center justify-center pt-2"
                      width="70"
                      height="70"
                      border="none"
                      link
                      rounded="lg"
                    >
                      <v-icon icon="mdi-timeline-check" size="24" />
                      <v-card-title class="text-caption">Projects</v-card-title>
                    </v-card>
                    <v-card
                      class="d-flex flex-column align-center justify-center pt-2"
                      width="70"
                      height="70"
                      border="none"
                      link
                      rounded="lg"
                    >
                      <v-icon icon="mdi-handshake" size="24" />
                      <v-card-title class="text-caption">CRM</v-card-title>
                    </v-card>
                    <v-card
                      class="d-flex flex-column align-center justify-center pt-2"
                      width="70"
                      height="70"
                      border="none"
                      link
                      rounded="lg"
                    >
                      <v-icon icon="mdi-application-braces" size="24" />
                      <v-card-title class="text-caption">Agile</v-card-title>
                    </v-card>
                  </v-card>
                </v-menu>
                <v-list-item to="/settings/theme">
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
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view />
      {{ workspace }}
    </v-main>
  </v-app>
</template>
