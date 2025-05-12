<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useDialogStore } from '@/stores/dialog';
import { useSnackbarStore } from '@/stores/snackbar';

import { useUsersService } from '@/services/useUsersService';
import { useCardActivitiesService } from '@/services/useCardActivitiesService';

import {
  dayjs,
  TASK_STATUS_OPTIONS,
  type CardActivity,
  type TaskActivityStatus,
} from '@tillywork/shared';
import { DIALOGS } from '@/components/common/dialogs/types';

import BaseEditorInput from '@/components/common/inputs/BaseEditor/BaseEditorInput.vue';
import BaseUserSelector from '@/components/common/inputs/BaseUserSelector/BaseUserSelector.vue';
import BaseDatePicker from '@/components/common/inputs/BaseDatePicker.vue';
import SimpleDropdownSelector from '@/components/common/inputs/SimpleDropdownSelector.vue';
import { useQueryStore } from '@/stores/query';

const { activity } = defineProps<{
  activity: CardActivity;
}>();

const { user } = storeToRefs(useAuthStore());
const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();
const { users } = storeToRefs(useQueryStore());

const { getUserFullName } = useUsersService();
const { useDeleteActivityMutation, useUpdateActivityMutation } =
  useCardActivitiesService();

const { mutateAsync: deleteActivity, isPending: isDeleting } =
  useDeleteActivityMutation();
const { mutateAsync: updateActivity, isPending: isUpdating } =
  useUpdateActivityMutation();

const confirmDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);

function openConfirmDeleteDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: 'Are you sure you want to delete this task?',
      onCancel: () => dialog.closeDialog(confirmDialogIndex.value),
      onConfirm: () => deleteTask(),
      isLoading: isDeleting.value,
    },
  });
}

function deleteTask() {
  deleteActivity({
    activityId: activity.id,
  })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    })
    .finally(() => {
      dialog.closeDialog(confirmDialogIndex.value);
    });
}

function updateTask(data: Partial<CardActivity>) {
  if (!isUpdating.value && !isDeleting.value) {
    updateActivity({
      activity: {
        id: activity.id,
        ...data,
      },
    }).catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
      });
    });
  }
}

function updateTaskAssignee(assignee: number[]) {
  const newContent = {
    ...activity.content,
    assignee,
  };

  updateTask({
    content: newContent,
  });
}

function updateTaskStatus(status: TaskActivityStatus) {
  const newContent = {
    ...activity.content,
    status,
  };

  updateTask({
    content: newContent,
  });
}

function updateTaskDueDate(dueAt: string) {
  const newContent = {
    ...activity.content,
    dueAt,
  };

  updateTask({
    content: newContent,
  });
}
</script>

<template>
  <v-timeline-item class="text-caption" size="small">
    <template #icon>
      <base-avatar
        :text="getUserFullName(activity.createdBy)"
        :photo="activity.createdBy.photo"
        class="text-xs"
        size="small"
      />
    </template>
    <v-card border="thin" class="w-100">
      <v-card-text
        class="py-1 px-3 border-b-thin bg-accent text-caption d-flex align-center"
      >
        <span>
          {{
            user?.id === activity.createdBy.id
              ? 'You'
              : getUserFullName(activity.createdBy)
          }}
        </span>
        <span class="text-surface-variant">
          &nbsp;created a task
          {{ dayjs(activity.createdAt).fromNow() }}
        </span>
        <v-spacer />
        <v-menu>
          <template #activator="{ props }">
            <base-icon-btn
              v-bind="props"
              icon="mdi-dots-vertical"
              size="x-small"
            />
          </template>
          <v-card class="border-thin">
            <v-list>
              <v-list-item
                class="text-error"
                @click="openConfirmDeleteDialog()"
              >
                <template #prepend>
                  <v-icon icon="mdi-delete" />
                </template>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-card-text>
      <v-card-text>
        <base-editor-input
          v-model:text="activity.content.title"
          :heading="3"
          :editable="false"
        />
        <base-editor-input
          v-if="activity.content.description"
          :model-value="activity.content.description"
          :editable="false"
        />
      </v-card-text>
      <v-card-actions class="px-3 border-t-thin">
        <simple-dropdown-selector
          :model-value="activity.content.status"
          :items="TASK_STATUS_OPTIONS"
          @update:model-value="(v) => updateTaskStatus(v as TaskActivityStatus)"
          icon="mdi-circle-slice-8"
        />
        <base-user-selector
          v-if="users"
          :model-value="activity.content.assignee"
          @update:model-value="(v) => updateTaskAssignee(v as number[])"
          :users
          label="Assignee"
          return-id
        />
        <base-date-picker
          :model-value="activity.content.dueAt"
          include-time
          label="Due date"
          icon="mdi-calendar"
          @update:model-value="(v) => updateTaskDueDate(v as string)"
        />
      </v-card-actions>
    </v-card>
  </v-timeline-item>
</template>
