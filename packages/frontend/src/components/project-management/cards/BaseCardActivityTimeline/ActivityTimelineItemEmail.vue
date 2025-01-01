<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useDialogStore } from '@/stores/dialog';
import { useSnackbarStore } from '@/stores/snackbar';

import { useUsersService } from '@/services/useUsersService';
import { useCardActivitiesService } from '@/services/useCardActivitiesService';

import { dayjs, type Card, type CardActivity } from '@tillywork/shared';
import { DIALOGS } from '@/components/common/dialogs/types';

import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import BaseDatePicker from '@/components/common/inputs/BaseDatePicker.vue';

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
      message: 'Are you sure you want to delete this email?',
      onCancel: () => dialog.closeDialog(confirmDialogIndex.value),
      onConfirm: () => deleteEmail(),
      isLoading: isDeleting.value,
    },
  });
}

function deleteEmail() {
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

function updateEmail(data: Partial<CardActivity>) {
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

function updateEmailSentAt(sentAt: string) {
  const newContent = {
    ...activity.content,
    sentAt,
  };

  updateEmail({
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
          &nbsp;logged an email
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
          v-if="activity.content.subject"
          v-model="activity.content.subject"
          :heading="4"
        />
        <base-editor-input v-model:html="activity.content.body" />
      </v-card-text>
      <v-card-actions class="px-3 border-t-thin">
        <span class="text-body-3 me-2">
          <span class="font-weight-bold">To:&nbsp;</span>
          <span>{{ activity.content.to }}</span>
        </span>
        <base-date-picker
          :model-value="activity.content.sentAt"
          include-time
          label="Sent At"
          icon="mdi-calendar"
          @update:model-value="(v) => updateEmailSentAt(v as string)"
        />
      </v-card-actions>
    </v-card>
  </v-timeline-item>
</template>
