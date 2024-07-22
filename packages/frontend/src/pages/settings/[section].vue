<script setup lang="ts">
import { SETTINGS } from '@/components/common/settings/types';
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

onMounted(() => {
  if (!sections.includes(route.params.section)) {
    // TEMP: Throw a 404 error.
    router.replace('/');
  }

  document.title =
    'Settings - ' + stringUtils.snakeToTitleCase(route.params.section);
});

watch(route, (v) => {
  if (v)
    document.title =
      'Settings - ' + stringUtils.snakeToTitleCase(route.params.section);
});
</script>

<template>
  <div class="d-flex">
    <v-navigation-drawer color="background" class="user-select-none">
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

    <div class="px-4 py-3 w-100">
      <component :is="settings[route.params.section as SETTINGS].component" />
    </div>
  </div>
</template>
