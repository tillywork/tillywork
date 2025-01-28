<script setup lang="ts">
import ActivityTimelineItemUpdate from './ActivityTimelineItemUpdate.vue';
import ActivityTimelineItemComment from './ActivityTimelineItemComment.vue';
import ActivityTimelineItemTask from './ActivityTimelineItemTask.vue';
import ActivityTimelineItemEmail from './ActivityTimelineItemEmail.vue';
import ActivityTimelineItemCall from './ActivityTimelineItemCall.vue';
import ActivityTimelineItemMessage from './ActivityTimelineItemMessage.vue';
import ActivityTimelineItemMeeting from './ActivityTimelineItemMeeting.vue';

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
  <template v-else-if="activity.type === ActivityType.EMAIL">
    <activity-timeline-item-email :activity :card />
  </template>
  <template v-else-if="activity.type === ActivityType.CALL">
    <activity-timeline-item-call :activity :card />
  </template>
  <template v-else-if="activity.type === ActivityType.MESSAGE">
    <activity-timeline-item-message :activity :card />
  </template>
  <template v-else-if="activity.type === ActivityType.MEETING">
    <activity-timeline-item-meeting :activity :card />
  </template>
  <template v-else>
    <v-timeline-item>
      <span class="text-error text-caption"
        >Unknown activity type: {{ activity.type }}</span
      >
    </v-timeline-item>
  </template>
</template>
