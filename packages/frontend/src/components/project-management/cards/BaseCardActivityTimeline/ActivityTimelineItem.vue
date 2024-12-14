<script setup lang="ts">
import ActivityTimelineItemUpdate from './ActivityTimelineItemUpdate.vue';
import ActivityTimelineItemComment from './ActivityTimelineItemComment.vue';
import ActivityTimelineItemTask from './ActivityTimelineItemTask.vue';

import { type Card, type CardActivity, ActivityType } from '@tillywork/shared';

const { activity, card } = defineProps<{
  activity: CardActivity;
  card: Card;
}>();
</script>

<template>
  <template v-if="activity.type === ActivityType.UPDATE">
    <activity-timeline-item-update :activity :card />
  </template>
  <template v-else-if="activity.type === ActivityType.COMMENT">
    <activity-timeline-item-comment :activity :card />
  </template>
  <template v-else-if="activity.type === ActivityType.TASK">
    <activity-timeline-item-task :activity :card />
  </template>
  <template v-else>
    <v-timeline-item>
      <span class="text-error text-caption"
        >Unknown activity type: {{ activity.type }}</span
      >
    </v-timeline-item>
  </template>
</template>
