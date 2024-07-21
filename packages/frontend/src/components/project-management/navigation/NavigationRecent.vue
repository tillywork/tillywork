<script setup lang="ts">
import { useProjectUserActivityService } from '@/composables/services/useProjectUserActivityService';

const { useGetProjectUserActivitiesQuery } = useProjectUserActivityService();
const { data: activities } = useGetProjectUserActivitiesQuery({
  isRecent: true,
  params: { limit: 2 },
});

type Recent = {
  title: string;
  path: string;
  type: string;
};
const recents = ref<Recent[]>([]);

watch(activities, async (v) => {
  if (v) {
    recents.value = v
      .map((activity) => {
        if (activity.type === 'VIEW') {
          if (activity.entity) {
            const type = activity.entityType.toLowerCase();
            return {
              title: activity.entity.title ?? activity.entity.name,
              path: `/pm/${type}/${activity.entityId}`, // TODO-Next: implement workspace slug
              type,
            };
          }
        }
      })
      .filter(Boolean) as Recent[];
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
          <v-chip size="small" class="mr-4">
            {{ recent.type }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
