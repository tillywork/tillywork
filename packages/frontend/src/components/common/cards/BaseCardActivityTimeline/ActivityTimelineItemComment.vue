<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

import {
  type ActivityContent,
  dayjs,
  type Card,
  type CardActivity,
} from '@tillywork/shared';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '@/components/common/dialogs/types';
import { useCardActivitiesService } from '@/services/useCardActivitiesService';
import { useSnackbarStore } from '@/stores/snackbar';

import BaseEditorInput from '@/components/common/inputs/BaseEditor/BaseEditorInput.vue';
import { useCreatedBy } from '@/composables/useCreatedBy';

const { activity } = defineProps<{
  activity: CardActivity;
  card: Card;
}>();

const { user } = storeToRefs(useAuthStore());
const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();

const { getCreatedByName, getCreatedByPhoto } = useCreatedBy();

const { useDeleteActivityMutation } = useCardActivitiesService();
const { mutateAsync: deleteActivity, isPending: isDeleting } =
  useDeleteActivityMutation();

const confirmDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);

const isCurrentUser = computed(() => user.value?.id === activity.createdBy?.id);

const displayName = computed(() => {
  if (activity.createdByType === 'user') {
    return isCurrentUser.value ? 'You' : activity.createdBy?.firstName;
  }

  if (activity.createdByType === 'system') {
    return 'System';
  }

  if (activity.createdByType === 'automation') {
    return 'An automation';
  }

  return 'Unknown';
});

function openConfirmDeleteDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: 'Are you sure you want to delete this comment?',
      onCancel: () => dialog.closeDialog(confirmDialogIndex.value),
      onConfirm: () => deleteComment(),
      isLoading: isDeleting.value,
    },
  });
}

function deleteComment() {
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
</script>

<template>
  <v-timeline-item class="text-caption" size="small">
    <template #icon>
      <base-avatar
        :text="getCreatedByName(activity)"
        :photo="getCreatedByPhoto(activity)"
        class="text-xs"
        size="small"
      />
    </template>
    <v-card border="thin" class="w-100">
      <v-card-text
        class="py-1 px-3 border-b-thin bg-accent text-caption d-flex align-center"
      >
        <span>
          {{ displayName }}
        </span>
        <span class="text-surface-variant">
          &nbsp;commented
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
          :model-value="activity.content as ActivityContent"
          :editable="false"
        />
      </v-card-text>
    </v-card>
  </v-timeline-item>
</template>
