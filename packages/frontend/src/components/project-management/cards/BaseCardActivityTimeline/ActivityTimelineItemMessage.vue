<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useDialogStore } from '@/stores/dialog';
import { useSnackbarStore } from '@/stores/snackbar';

import { useUsersService } from '@/services/useUsersService';
import { useCardActivitiesService } from '@/services/useCardActivitiesService';

import {
  dayjs,
  MESSAGE_CHANNEL_OPTIONS,
  MessageActivityChannel,
  type Card,
  type CardActivity,
} from '@tillywork/shared';
import { DIALOGS } from '@/components/common/dialogs/types';

import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import BaseDatePicker from '@/components/common/inputs/BaseDatePicker.vue';
import SimpleDropdownSelector from '@/components/common/inputs/SimpleDropdownSelector.vue';

const { activity, card } = defineProps<{
  activity: CardActivity;
  card: Card;
}>();

const { user } = storeToRefs(useAuthStore());
const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();

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
      message: 'Are you sure you want to delete this message?',
      onCancel: () => dialog.closeDialog(confirmDialogIndex.value),
      onConfirm: () => deleteMessage(),
      isLoading: isDeleting.value,
    },
  });
}

function deleteMessage() {
  deleteActivity({
    cardId: card.id,
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

function updateMessage(data: Partial<CardActivity>) {
  if (!isUpdating.value && !isDeleting.value) {
    updateActivity({
      cardId: card.id,
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

function updateMessageSentAt(sentAt: string) {
  const newContent = {
    ...activity.content,
    sentAt,
  };

  updateMessage({
    content: newContent,
  });
}

function updateMessageChannel(channel: MessageActivityChannel) {
  const newContent = {
    ...activity.content,
    channel,
  };

  updateMessage({
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
          &nbsp;logged a message
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
        <base-editor-input v-model:json="activity.content.description" />
      </v-card-text>
      <v-card-actions class="px-3 border-t-thin">
        <simple-dropdown-selector
          :model-value="activity.content.channel"
          @update:model-value="(v) => updateMessageChannel(v as MessageActivityChannel)"
          :items="MESSAGE_CHANNEL_OPTIONS"
          label="Channel"
        />
        <base-date-picker
          :model-value="activity.content.sentAt"
          @update:model-value="(v) => updateMessageSentAt(v as string)"
          include-time
          label="Sent At"
          icon="mdi-calendar"
        />
      </v-card-actions>
    </v-card>
  </v-timeline-item>
</template>
