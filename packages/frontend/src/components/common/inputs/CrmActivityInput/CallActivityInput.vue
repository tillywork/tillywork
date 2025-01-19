<script setup lang="ts">
import {
  CALL_DIRECTION_OPTIONS,
  CALL_OUTCOME_OPTIONS,
  type CallActivityContent,
  dayjs,
} from '@tillywork/shared';

import BaseCardCommentBox from '@/components/common/cards/BaseCardCommentBox.vue';
import BaseDatePicker from '../BaseDatePicker.vue';
import SimpleDropdownSelector from '../SimpleDropdownSelector.vue';

const emit = defineEmits(['submit']);

const createCallDto = ref<Partial<CallActivityContent>>({
  calledAt: dayjs().toISOString(),
});

function handleSubmit() {
  if (createCallDto.value.outcome) {
    emit('submit', createCallDto.value);
    resetDto();
  }
}

function resetDto() {
  createCallDto.value = {
    calledAt: dayjs().toISOString(),
  };
}
</script>

<template>
  <v-card>
    <base-card-comment-box
      v-model="createCallDto.description"
      border="none"
      class="pt-0 px-0"
      placeholder="Start typing.. (/ for commands)"
      @submit="handleSubmit"
    >
      <template #appendActions>
        <simple-dropdown-selector
          v-model="createCallDto.outcome"
          :items="CALL_OUTCOME_OPTIONS"
          label="Call Outcome"
        />
        <simple-dropdown-selector
          v-model="createCallDto.direction"
          :items="CALL_DIRECTION_OPTIONS"
          label="Call Direction"
          clearable
        />
        <base-date-picker
          v-model="createCallDto.calledAt"
          include-time
          label="Called At"
          icon="mdi-calendar"
        />
      </template>
    </base-card-comment-box>
  </v-card>
</template>
