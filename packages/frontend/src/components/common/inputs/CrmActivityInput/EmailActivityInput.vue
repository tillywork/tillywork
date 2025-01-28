<script setup lang="ts">
import { type EmailActivityContent, dayjs } from '@tillywork/shared';

import BaseEditorInput from '../../inputs/BaseEditor/BaseEditorInput.vue';
import BaseCardCommentBox from '@/components/common/cards/BaseCardCommentBox.vue';
import BaseDatePicker from '../BaseDatePicker.vue';
import BaseDropdownInput from '../BaseDropdownInput.vue';

const emit = defineEmits(['submit']);

const { to } = defineProps<{
  to: string;
}>();

const createEmailDto = ref<EmailActivityContent>({
  to,
  body: '',
  sentAt: dayjs().toISOString(),
});

function handleSubmit() {
  if (createEmailDto.value.to !== '' && createEmailDto.value.body !== '') {
    emit('submit', createEmailDto.value);
    resetDto();
  }
}

function resetDto() {
  createEmailDto.value = {
    to,
    body: '',
    sentAt: dayjs().toISOString(),
  };
}
</script>

<template>
  <v-card>
    <div class="d-flex align-center mb-1">
      <span class="text-body-2 me-2 font-weight-bold">To:</span>
      <base-dropdown-input
        :model-value="[createEmailDto.to]"
        @update:model-value="(v) => (createEmailDto.to = v[0])"
        label="To"
        width="250"
        color="accent"
        border="thin"
        mandatory
        :items="[{ item: to }]"
      />
    </div>
    <div class="d-flex align-center">
      <span class="text-body-2 me-2 font-weight-bold">Subject:</span>
      <base-editor-input
        v-model="createEmailDto.subject"
        single-line
        placeholder="Start typing.."
        editable
        disable-commands
        class="flex-1-1"
      />
    </div>
    <v-divider thickness="3" class="my-2" />
    <base-card-comment-box
      v-model:html="createEmailDto.body"
      border="none"
      class="pt-0 px-0"
      placeholder="Email Body"
      @submit="handleSubmit"
    >
      <template #appendActions>
        <base-date-picker
          v-model="createEmailDto.sentAt"
          include-time
          label="Sent At"
          icon="mdi-calendar"
        />
      </template>
    </base-card-comment-box>
  </v-card>
</template>
