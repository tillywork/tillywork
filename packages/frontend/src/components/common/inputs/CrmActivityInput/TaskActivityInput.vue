<script setup lang="ts">
import {
  TASK_STATUS_OPTIONS,
  type TaskActivityContent,
  dayjs,
} from '@tillywork/shared';

import BaseEditorInput from '../../base/BaseEditor/BaseEditorInput.vue';
import BaseCardCommentBox from '@/components/project-management/cards/BaseCardCommentBox.vue';
import BaseUserSelector from '../BaseUserSelector/BaseUserSelector.vue';
import BaseDatePicker from '../BaseDatePicker.vue';
import SimpleDropdownSelector from '../SimpleDropdownSelector.vue';

import { useQueryStore } from '@/stores/query';

const emit = defineEmits(['submit']);

const { users } = storeToRefs(useQueryStore());

const createTaskDto = ref<TaskActivityContent>({
  title: '',
  isCompleted: false,
  status: 'pending',
  dueAt: dayjs().toISOString(),
});

function handleSubmit() {
  if (createTaskDto.value.title !== '') {
    emit('submit', createTaskDto.value);
    resetDto();
  }
}

function resetDto() {
  createTaskDto.value = {
    title: '',
    isCompleted: false,
    status: 'pending',
  };
}
</script>

<template>
  <v-card>
    <base-editor-input
      v-model="createTaskDto.title"
      :heading="3"
      single-line
      placeholder="Task Title"
      editable
      disable-commands
    />
    <base-card-comment-box
      v-model="createTaskDto.description"
      border="none"
      class="pt-0 px-0"
      placeholder="Task description.. (/ for commands)"
      @submit="handleSubmit"
    >
      <template #appendActions>
        <simple-dropdown-selector
          v-model="createTaskDto.status"
          :items="TASK_STATUS_OPTIONS"
          icon="mdi-circle-slice-8"
        />
        <base-user-selector
          v-if="users"
          v-model="createTaskDto.assignee"
          return-id
          :users
          label="Assignee"
        />
        <base-date-picker
          v-model="createTaskDto.dueAt"
          include-time
          label="Due date"
          icon="mdi-calendar"
        />
      </template>
    </base-card-comment-box>
  </v-card>
</template>
