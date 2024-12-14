<script setup lang="ts">
import { type TaskActivityContent, dayjs } from '@tillywork/shared';

import BaseEditorInput from '../../base/BaseEditor/BaseEditorInput.vue';
import BaseCardCommentBox from '@/components/project-management/cards/BaseCardCommentBox.vue';
import BaseUserSelector from '../BaseUserSelector.vue';
import TaskStatusSelector from './TaskStatusSelector.vue';
import BaseDatePicker from '../BaseDatePicker.vue';

import { useUsers } from '@/composables/useUsers';

const emit = defineEmits(['submit']);

const createTaskDto = ref<TaskActivityContent>({
  title: '',
  isCompleted: false,
  status: 'pending',
  dueDate: dayjs().hour(12).minute(0).second(0).millisecond(0).toISOString(),
});

const { users } = useUsers();

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
        <task-status-selector v-model="createTaskDto.status" />
        <base-user-selector
          v-if="users"
          v-model="createTaskDto.assignee"
          return-id
          :users
          label="Assignee"
        />
        <base-date-picker
          v-model="createTaskDto.dueDate"
          include-time
          label="Due date"
          icon="mdi-calendar"
        />
      </template>
    </base-card-comment-box>
  </v-card>
</template>
