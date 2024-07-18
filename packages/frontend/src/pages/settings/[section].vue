<script setup lang="ts">
import { SETTINGS } from '@/components/common/settings/types';
import stringUtils from '@/utils/string';

definePage({
  meta: {
    hideNavigationDrawer: true,
  },
});

const route = useRoute();

const settingComponents = {
  [SETTINGS.THEME]: defineAsyncComponent(
    () => import('../../components/common/settings/ThemeSettings.vue')
  ),
  [SETTINGS.WORKSPACE]: defineAsyncComponent(
    () => import('../../components/common/settings/WorkspaceSettings.vue')
  ),
  [SETTINGS.CARD_TYPES]: defineAsyncComponent(
    () => import('../../components/common/settings/CardTypesSettings.vue')
  ),
};
const settingRoutes = Object.keys(settingComponents);

onMounted(() => {
  if (!settingRoutes.includes(route.params.section)) {
    // TEMP: Throw a 404 error.
    window.location.pathname = '/';
  }
});
</script>

<template>
  <div class="d-flex">
    <v-navigation-drawer color="background">
      <v-list>
        <v-list-item
          v-for="route in settingRoutes"
          :key="route"
          rounded="md"
          slim
          :to="'/settings/' + route"
        >
          <v-list-item-title>
            {{ stringUtils.snakeToTitleCase(route) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <div class="px-4 py-3 w-100">
      <component :is="settingComponents[route.params.section as SETTINGS]" />
    </div>
  </div>
</template>
