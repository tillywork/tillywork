<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useProjectUserActivityService } from '@/composables/services/useProjectUserActivityService';

const { useGetProjectUserActivitiesRecentQuery } =
  useProjectUserActivityService();
const { data: recents, refetch } = useGetProjectUserActivitiesRecentQuery({
  params: { limit: 2 },
});

const { workspace } = storeToRefs(useAuthStore());

watch(workspace, () => refetch());
</script>

<template>
  <v-card rounded="md" density="compact" color="transparent">
    <v-list>
      <v-list-subheader title="Recent" />
      <template v-if="recents?.length">
        <v-list-item
          v-for="(recent, i) in recents"
          :key="i"
          :title="recent.title"
          :to="recent.path"
          rounded="md"
          class="ms-2"
        />
      </template>
      <v-list-item v-else title="No Recent Data" class="ms-2" />
    </v-list>
  </v-card>
</template>
