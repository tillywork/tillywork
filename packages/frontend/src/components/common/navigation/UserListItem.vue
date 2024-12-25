<script setup lang="ts">
import { useUsersService } from '@/services/useUsersService';
import { useAuthStore } from '@/stores/auth';
import { useStateStore } from '@/stores/state';
import { WorkspaceTypes } from '@tillywork/shared';

const { getUserFullName } = useUsersService();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { setSelectedModule } = useStateStore();

defineProps<{
  avatarSize?: 'x-small' | 'small' | 'default';
}>();

type AppType = { title: string; icon: string; key: WorkspaceTypes };

const appOptions: AppType[] = [
  {
    title: 'Projects',
    icon: 'mdi-timeline-check',
    key: WorkspaceTypes.PROJECT_MANAGEMENT,
  },
  {
    title: 'CRM',
    icon: 'mdi-handshake',
    key: WorkspaceTypes.CRM,
  },
  {
    title: 'Product',
    icon: 'mdi-application-braces',
    key: WorkspaceTypes.AGILE_PROJECTS,
  },
];

function handleSelectApp(app: AppType) {
  setSelectedModule(app.key);
}
</script>

<template>
  <!-- User content -->
  <v-list v-if="authStore.isAuthenticated()" :slim="false">
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <v-list-item v-if="user" v-bind="props" class="user-list-item">
          <template #prepend>
            <base-avatar
              :photo="user.photo"
              :text="getUserFullName(user)"
              :size="avatarSize ?? 'default'"
              class="text-xs"
            />
          </template>
          <v-list-item-title class="text-truncate">
            {{ getUserFullName(user) }}
          </v-list-item-title>
          <template #append>
            <v-icon icon="mdi-dots-vertical" />
          </template>
        </v-list-item>
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
              <template v-for="app in appOptions" :key="app.title">
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
                  <v-card-title class="text-caption text-wrap text-center">{{
                    app.title
                  }}</v-card-title>
                </v-card>
              </template>
            </v-card>
          </v-menu>
          <v-list-item to="/settings/theme">
            <template #prepend>
              <v-icon icon="mdi-cog" />
            </template>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-list-item @click="authStore.logout()">
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

<style lang="scss">
.user-list-item {
  .v-list-item__append > .v-icon ~ .v-list-item__spacer {
    width: 12px;
  }
}
</style>
