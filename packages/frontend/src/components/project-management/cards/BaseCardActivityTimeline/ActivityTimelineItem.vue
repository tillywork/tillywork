<script setup lang="ts">
import ActivityTimelineItemUpdate from './ActivityTimelineItemUpdate.vue';
import ActivityTimelineItemComment from './ActivityTimelineItemComment.vue';
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
  <template v-else>
    <activity-timeline-item-comment :activity :card />
  </template>
</template>
