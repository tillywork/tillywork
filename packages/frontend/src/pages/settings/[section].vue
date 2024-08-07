<script setup lang="ts">
import { SETTINGS } from '@/components/common/settings/types';
import { useLogo } from '@/composables/useLogo';
import { useSettings } from '@/composables/useSettings';
import stringUtils from '@/utils/string';

definePage({
  meta: {
    hideNavigationDrawer: true,
  },
});

const route = useRoute('/settings/[section]');
const router = useRouter();
const { settings, sections } = useSettings();
const logo = useLogo();

const navigationDrawer = ref(true);

onMounted(() => {
  if (!sections.includes(route.params.section)) {
    // TEMP: Throw a 404 error.
    router.replace('/');
  }
});

watch(
  route,
  (v) => {
    if (v)
      document.title = `${stringUtils.snakeToTitleCase(
        route.params.section
      )} - tillywork`;
  },
  { immediate: true }
);
</script>

<template>
  <v-navigation-drawer v-model="navigationDrawer" class="user-select-none">
    <div class="pa-3 pb-0">
      <v-btn
        class="text-none"
        color="default"
        variant="text"
        prepend-icon="mdi-chevron-left"
        to="/"
      >
        Settings
      </v-btn>
    </div>
    <v-list>
      <v-list-item
        v-for="section in sections"
        :key="section"
        :to="'/settings/' + section"
        rounded="md"
        slim
      >
        <template #prepend>
          <v-icon>{{ settings[section as SETTINGS].icon }}</v-icon>
        </template>
        <v-list-item-title>
          {{ stringUtils.snakeToTitleCase(section) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-container class="fill-height bg-surface" fluid>
    <v-app-bar
      v-if="$vuetify.display.mdAndDown"
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

    <v-row justify="center" class="fill-height">
      <v-col cols="12" md="8" class="pt-md-16">
        <v-card class="pa-4" max-width="100%">
          <component
            :is="settings[route.params.section as SETTINGS].component"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
