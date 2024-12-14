<script setup lang="ts">
import { WorkspaceTypes } from '@tillywork/shared';
import UserListItem from './UserListItem.vue';

import { useAuthStore } from '@/stores/auth';
import { useStateStore } from '@/stores/state';

type AppOption = {
  title: string;
  icon: string;
  type: WorkspaceTypes;
  route: string;
  enabled: boolean;
};

const userMenu = ref(false);

const { isAuthenticated, logout } = useAuthStore();
const { setSelectedModule, toggleFreezeRail } = useStateStore();

const appOptions: AppOption[] = [
  {
    title: 'Projects',
    icon: 'mdi-timeline-check',
    type: WorkspaceTypes.PROJECT_MANAGEMENT,
    route: '/pm',
    enabled: true,
  },
  {
    title: 'CRM',
    icon: 'mdi-handshake',
    type: WorkspaceTypes.CRM,
    route: '/crm',
    enabled: true,
  },
  {
    title: 'Product',
    icon: 'mdi-application-braces',
    type: WorkspaceTypes.AGILE_PROJECTS,
    route: '/product',
    enabled: false,
  },
];

function handleSelectApp(app: AppOption) {
  //change selected module in state store
  //if no workspaces exist, begin onboarding for app
  //redirect to correct place
  setSelectedModule(app.type);
}

watch(userMenu, () => toggleFreezeRail());
</script>

<template>
  <v-list v-if="isAuthenticated()" :slim="false">
    <v-menu v-model="userMenu" :close-on-content-click="false">
      <template #activator="{ props }">
        <user-list-item v-bind="props" avatar-size="small">
          <template #append>
            <v-icon icon="mdi-dots-vertical" />
          </template>
        </user-list-item>
      </template>
      <v-card class="border-thin ms-n2">
        <v-list>
          <v-menu location="right" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon icon="mdi-apps" />
                </template>
                <v-list-item-title>Apps</v-list-item-title>
                <template #append>
                  <v-icon icon="mdi-chevron-right" />
                </template>
              </v-list-item>
            </template>
            <v-card
              class="d-flex flex-wrap align-center ga-3 pa-4"
              width="268"
              rounded="lg"
            >
              <template v-for="app in appOptions" :key="app.type">
                <template v-if="app.enabled">
                  <v-card
                    class="d-flex flex-column align-center justify-center pt-2"
                    width="70"
                    height="70"
                    border="none"
                    link
                    rounded="lg"
                    @click="handleSelectApp(app)"
                  >
                    <v-icon :icon="app.icon" size="24" />
                    <v-card-title class="text-caption">{{
                      app.title
                    }}</v-card-title>
                  </v-card>
                </template>
              </template>
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
