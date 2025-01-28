<script setup lang="ts">
import BaseCardCommentBox from '@/components/common/cards/BaseCardCommentBox.vue';
import TaskActivityInput from './TaskActivityInput.vue';
import EmailActivityInput from './EmailActivityInput.vue';
import CallActivityInput from './CallActivityInput.vue';
import MessageActivityInput from './MessageActivityInput.vue';
import MeetingActivityInput from './MeetingActivityInput.vue';

import {
  ActivityType,
  type ActivityTypeOption,
  type Card,
  type TiptapContent,
} from '@tillywork/shared';
import { useCardActivitiesService } from '@/services/useCardActivitiesService';

const { card } = defineProps<{
  card: Card;
}>();

const { useCreateActivityMutation } = useCardActivitiesService();
const { mutateAsync: createActivity, isPending: isCreating } =
  useCreateActivityMutation();

const activityType = ref<ActivityType>(ActivityType.COMMENT);
const activityTypes: ActivityTypeOption[] = [
  {
    name: 'Comment',
    type: ActivityType.COMMENT,
    icon: 'mdi-comment-account',
  },
  {
    name: 'Task',
    type: ActivityType.TASK,
    icon: 'mdi-calendar-check',
  },
  {
    name: 'Email',
    type: ActivityType.EMAIL,
    icon: 'mdi-email',
  },
  {
    name: 'Call',
    type: ActivityType.CALL,
    icon: 'mdi-phone',
  },
  {
    name: 'Message',
    type: ActivityType.MESSAGE,
    icon: 'mdi-message',
  },
  {
    name: 'Meeting',
    type: ActivityType.MEETING,
    icon: 'mdi-laptop-account',
  },
];

function handleSubmit(value: TiptapContent) {
  if (!isCreating.value) {
    createActivity({
      cardId: card.id,
      type: activityType.value,
      content: value,
    }).catch(() => {
      console.error('Something went wrong');
    });
  }
}
</script>

<template>
  <v-card border="thin">
    <v-card-item>
      <v-chip-group v-model="activityType" color="primary" mandatory>
        <template
          v-for="activityType in activityTypes"
          :key="activityType.type"
        >
          <v-chip density="comfortable" :value="activityType.type">
            <template #prepend>
              <v-icon :icon="activityType.icon" class="me-2" />
            </template>
            <span class="text-caption">
              {{ activityType.name }}
            </span>
          </v-chip>
        </template>
      </v-chip-group>
    </v-card-item>
    <template v-if="activityType === ActivityType.COMMENT">
      <base-card-comment-box
        @submit="handleSubmit"
        placeholder="Recent updates.. (/ for commands)"
        class="pt-0"
        border="none"
      />
    </template>
    <template v-else-if="activityType === ActivityType.TASK">
      <task-activity-input class="px-4" @submit="handleSubmit" />
    </template>
    <template v-else-if="activityType === ActivityType.EMAIL">
      <email-activity-input
        class="px-4"
        @submit="handleSubmit"
        :to="card.data.email"
      />
    </template>
    <template v-else-if="activityType === ActivityType.CALL">
      <call-activity-input class="px-4" @submit="handleSubmit" />
    </template>
    <template v-else-if="activityType === ActivityType.MESSAGE">
      <message-activity-input class="px-4" @submit="handleSubmit" />
    </template>
    <template v-else-if="activityType === ActivityType.MEETING">
      <meeting-activity-input class="px-4" @submit="handleSubmit" />
    </template>
  </v-card>
</template>
