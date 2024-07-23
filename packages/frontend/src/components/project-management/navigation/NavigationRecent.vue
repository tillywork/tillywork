<script setup lang="ts">
import {
  useProjectUserActivityService,
  type RecentActivity,
} from '@/composables/services/useProjectUserActivityService';

const { useGetProjectUserActivitiesRecentQuery } =
  useProjectUserActivityService();
const { data: activities } = useGetProjectUserActivitiesRecentQuery({
  params: { limit: 2 },
});

const recents = ref<RecentActivity[]>([]);

watch(activities, async (v) => {
  if (v) {
    recents.value = v;
  }
});
</script>

<template>
  <v-card rounded="md" density="compact" color="transparent" link>
    <v-list>
      <v-list-subheader title="Recent" />
      <v-list-item v-if="!recents.length" title="No Recent Data" class="ms-2" />

      <v-list-item
        v-for="(recent, i) in recents"
        :key="i"
        :title="recent.title"
        :to="recent.path"
        rounded="md"
        class="ms-2"
      >
        <template #prepend>
          <v-chip size="small" class="text-capitalize mr-4">
            {{ recent.type }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
