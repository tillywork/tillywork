<script setup lang="ts">
import {
  dayjs,
  MEETING_OUTCOME_OPTIONS,
  type MeetingActivityContent,
} from '@tillywork/shared';

import BaseCardCommentBox from '@/components/project-management/cards/BaseCardCommentBox.vue';
import BaseDatePicker from '../BaseDatePicker.vue';
import SimpleDropdownSelector from '../SimpleDropdownSelector.vue';

const emit = defineEmits(['submit']);

const createMeetingDto = ref<Partial<MeetingActivityContent>>({
  meetingAt: dayjs().toISOString(),
});

function handleSubmit() {
  if (createMeetingDto.value.outcome) {
    emit('submit', createMeetingDto.value);
    resetDto();
  }
}

function resetDto() {
  createMeetingDto.value = {
    meetingAt: dayjs().toISOString(),
  };
}
</script>

<template>
  <v-card>
    <base-card-comment-box
      v-model="createMeetingDto.description"
      border="none"
      class="pt-0 px-0"
      placeholder="Start typing.. (/ for commands)"
      @submit="handleSubmit"
    >
      <template #appendActions>
        <simple-dropdown-selector
          v-model="createMeetingDto.outcome"
          :items="MEETING_OUTCOME_OPTIONS"
          label="Meeting Outcome"
        />
        <base-date-picker
          v-model="createMeetingDto.meetingAt"
          include-time
          label="Meeting At"
          icon="mdi-calendar"
        />
      </template>
    </base-card-comment-box>
  </v-card>
</template>
