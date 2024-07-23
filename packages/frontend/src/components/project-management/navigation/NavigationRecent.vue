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
  <v-card rounded="md" density="compact" color="transparent" link>
    <v-list>
      <v-list-subheader title="Recent" />
      <div v-if="recents?.length">
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
      </div>
      <v-list-item v-else title="No Recent Data" class="ms-2" />
    </v-list>
  </v-card>
</template>
