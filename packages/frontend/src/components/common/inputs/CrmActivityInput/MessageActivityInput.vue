<script setup lang="ts">
import {
  dayjs,
  MESSAGE_CHANNEL_OPTIONS,
  type MessageActivityContent,
} from '@tillywork/shared';

import BaseCardCommentBox from '@/components/project-management/cards/BaseCardCommentBox.vue';
import BaseDatePicker from '../BaseDatePicker.vue';
import SimpleDropdownSelector from '../SimpleDropdownSelector.vue';

const emit = defineEmits(['submit']);

const createMessageDto = ref<Partial<MessageActivityContent>>({
  sentAt: dayjs().toISOString(),
});

function handleSubmit() {
  if (createMessageDto.value) {
    emit('submit', createMessageDto.value);
    resetDto();
  }
}

function resetDto() {
  createMessageDto.value = {
    sentAt: dayjs().toISOString(),
  };
}
</script>

<template>
  <v-card>
    <base-card-comment-box
      v-model="createMessageDto.description"
      border="none"
      class="pt-0 px-0"
      placeholder="Start typing.. (/ for commands)"
      @submit="handleSubmit"
    >
      <template #appendActions>
        <simple-dropdown-selector
          v-model="createMessageDto.channel"
          :items="MESSAGE_CHANNEL_OPTIONS"
          label="Channel"
        />
        <base-date-picker
          v-model="createMessageDto.sentAt"
          include-time
          label="Sent At"
          icon="mdi-calendar"
        />
      </template>
    </base-card-comment-box>
  </v-card>
</template>
