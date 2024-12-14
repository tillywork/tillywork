<script setup lang="ts">
import ActivityTimelineItem from './ActivityTimelineItem.vue';
import BaseCardCommentBox from '../BaseCardCommentBox.vue';

import { useCardActivitiesService } from '@/services/useCardActivitiesService';
import { useAuthStore } from '@/stores/auth';

import type { Content } from '@tiptap/vue-3';
import type { Card } from '@tillywork/shared';

const props = defineProps<{
  card: Card;
  hideCommentInput?: boolean;
}>();

const emit = defineEmits(['comment']);

const { useFindAllQuery } = useCardActivitiesService();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const comment = ref<Content>();
const isCommentEmpty = ref<boolean>();

const cardId = computed(() => props.card.id);

const { data: activities, refetch } = useFindAllQuery({
  cardId,
  sortBy: {
    key: 'createdAt',
    order: 'desc',
  },
});

function createComment() {
  if (!isCommentEmpty.value) {
    emit('comment', comment.value);
    comment.value = undefined;
  }
}

watch(cardId, () => {
  refetch();
});
</script>

<template>
  <template v-if="user && !hideCommentInput">
    <base-card-comment-box
      v-model="comment"
      v-model:empty="isCommentEmpty"
      placeholder="Write comment.. (/ for commands)"
      @submit="createComment"
      class="my-4"
    />
  </template>
  <v-timeline
    side="end"
    density="compact"
    size="x-small"
    truncate-line="both"
    class="card-activities pa-3 pt-6 ps-1"
    align="start"
  >
    <template v-for="activity in activities" :key="activity.id">
      <activity-timeline-item :activity :card />
    </template>
  </v-timeline>
</template>
