<script setup lang="ts">
import { SETTINGS } from '@/components/common/settings/types';
import { useSettings } from '@/composables/useSettings';
import stringUtils from '@/utils/string';

import { useProjectUserActivityService } from '@/composables/services/useProjectUserActivityService';

definePage({
  meta: {
    hideNavigationDrawer: true,
  },
});

const route = useRoute('/settings/[section]');
const router = useRouter();
const { settings, sections } = useSettings();

const { useCreateProjectUserActivityMutation } =
  useProjectUserActivityService();
const { mutateAsync: createProjectUserActivity } =
  useCreateProjectUserActivityMutation();

onMounted(() => {
  if (!sections.includes(route.params.section)) {
    // TEMP: Throw a 404 error.
    router.replace('/');
  }
});

watch(
  route,
  (v) => {
    if (v) {
      createProjectUserActivity({
        activity: {
          type: 'SETTING',
          name: route.params.section,
          path: route.path,
        },
      });

      document.title = `${stringUtils.snakeToTitleCase(
        route.params.section
      )} - tillywork`;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="d-flex">
    <v-navigation-drawer color="background" class="user-select-none">
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

    <v-container>
      <v-row justify="center">
        <v-col cols="8" class="mt-12">
          <component
            :is="settings[route.params.section as SETTINGS].component"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
