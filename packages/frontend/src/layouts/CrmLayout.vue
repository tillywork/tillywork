<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import type { NavigationMenuItem } from '@/components/common/navigation/types';
import { useHideNavigationDrawer } from '@/composables/useHideNavigationDrawer';
import { useLogo } from '@/composables/useLogo';
import NavigationWorkspaceSelector from '@/components/common/navigation/NavigationWorkspaceSelector.vue';
import UserMenu from '@/components/common/navigation/UserMenu.vue';
import { useStateStore } from '@/stores/state';

const { isRailFrozen } = storeToRefs(useStateStore());

const authStore = useAuthStore();
const { isAuthenticated } = authStore;
const { hideNavigationDrawer } = useHideNavigationDrawer();
const navigationDrawer = ref(true);
const isRail = ref(true);
const logo = useLogo();

const navigationMenuItems = ref<NavigationMenuItem[]>([
  {
    icon: 'mdi-draw',
    title: 'Whiteboard',
    route: '/whiteboard',
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
      v-model:rail="isRail"
      app
      :expand-on-hover="!isRailFrozen"
    >
      <div class="position-relative">
        <v-img
          :src="logo.getCheckUrl()"
          min-height="25"
          min-width="25"
          height="25"
          width="25"
          class="ma-2 ms-4 mt-4 hidden-md-and-down"
        />
        <v-img
          v-if="!isRail"
          :src="logo.getLogoUrlByTheme()"
          min-height="35"
          min-width="125"
          height="35"
          width="125"
          class="ms-2 hidden-md-and-down position-absolute"
          :style="{ top: '-5px', left: '-1px' }"
        />
      </div>
      <v-divider class="hidden-md-and-down" />
      <navigation-workspace-selector
        v-if="isAuthenticated()"
        v-model:only-icon="isRail"
      />

      <v-list class="mt-2">
        <v-list-item
          v-for="navigationItem in navigationMenuItems"
          :key="navigationItem.title"
          :to="navigationItem.route"
          @click="navigationItem.onClick"
          :exact="navigationItem.activeOnExactMatch"
          rounded="md"
        >
          <template #prepend v-if="navigationItem.icon">
            <v-icon :icon="navigationItem.icon" class="ms-1" />
          </template>
          <v-list-item-title v-if="!isRail">{{
            navigationItem.title
          }}</v-list-item-title>
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
              <v-icon :icon="navigationItem.icon" class="ms-1" />
            </template>
            <v-list-item-title>{{ navigationItem.title }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

      <template v-slot:append>
        <!-- User content -->
        <user-menu />
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
