<script setup lang="ts">
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import { useCardActivitiesService } from '@/composables/services/useCardActivitiesService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { ActivityType, type CardActivity } from './types';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '@/components/common/dialogs/types';
import { useSnackbarStore } from '@/stores/snackbar';

dayjs.extend(relativeTime);

const props = defineProps<{
  cardId: number;
}>();

const cardActivitiesService = useCardActivitiesService();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const dialog = useDialog();
const snackbar = useSnackbarStore();

const query = cardActivitiesService.useFindAllQuery(props.cardId);
const deleteActivity = cardActivitiesService.useDeleteActivityMutation({
  cardId: props.cardId,
});

function openConfirmDeleteDialog(comment: CardActivity) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: 'Are you sure you want to delete this comment?',
      onCancel: dialog.closeDialog,
      onConfirm: () => deleteComment(comment),
      isLoading: deleteActivity.isPending.value,
    },
  });
}

function deleteComment(comment: CardActivity) {
  deleteActivity
    .mutateAsync({
      cardId: props.cardId,
      activityId: comment.id,
    })
    .catch(() => {
      snackbar.showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    })
    .finally(() => {
      dialog.closeDialog();
    });
}
</script>

<template>
  <v-timeline
    side="end"
    density="compact"
    size="x-small"
    truncate-line="both"
    class="card-activities pa-3 pt-6 ps-1"
    align="start"
  >
    <template v-for="activity in query.data.value" :key="activity.id">
      <template v-if="activity.type === ActivityType.UPDATE">
        <v-timeline-item class="text-caption">
          <template #icon>
            <base-avatar
              :text="
                activity.createdBy.firstName + ' ' + activity.createdBy.lastName
              "
              :photo="activity.createdBy.photo"
            />
          </template>
          <span>
            {{
              user?.id === activity.createdBy.id
                ? 'You'
                : activity.createdBy.firstName
            }}
            <span class="text-grey">
              {{ activity.content.text }}
              {{ dayjs(activity.createdAt).fromNow() }}
            </span>
          </span>
        </v-timeline-item>
      </template>
      <template v-else>
        <v-timeline-item class="text-caption" size="default">
          <template #icon>
            <base-avatar
              :text="
                activity.createdBy.firstName + ' ' + activity.createdBy.lastName
              "
              :photo="activity.createdBy.photo"
              size="default"
            />
          </template>
          <v-card border="thin" class="w-100">
            <v-card-text
              class="py-2 px-3 border-b-thin bg-accent text-caption d-flex align-center"
            >
              <span>
                {{
                  user?.id === activity.createdBy.id
                    ? 'You'
                    : activity.createdBy.firstName +
                      ' ' +
                      activity.createdBy.lastName
                }}
              </span>
              <span class="text-surface-variant">
                &nbsp;commented
                {{ dayjs(activity.createdAt).fromNow() }}
              </span>
              <v-spacer />
              <v-menu offset="2" width="200">
                <template #activator="{ props }">
                  <base-icon-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    size="x-small"
                  />
                </template>
                <v-card color="accent" class="border-thin">
                  <v-list
                    class="bg-transparent"
                    :lines="false"
                    nav
                    density="compact"
                  >
                    <v-list-item
                      slim
                      class="text-error"
                      @click="openConfirmDeleteDialog(activity)"
                    >
                      <template #prepend>
                        <v-icon size="16" icon="mdi-delete" />
                      </template>
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </v-card-text>
            <v-card-text>
              <base-editor-input v-model:json="activity.content" />
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </template>
    </template>
  </v-timeline>
</template>
