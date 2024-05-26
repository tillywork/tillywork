<script setup lang="ts">
import { ActivityType, type ActivityContent, type Card } from './types';
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import BaseCardCommentBox from './BaseCardCommentBox.vue';
import BaseCardActivityTimeline from './BaseCardActivityTimeline.vue';
import { useCardsService } from '@/composables/services/useCardsService';
import { useSnackbarStore } from '@/stores/snackbar';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useCardActivitiesService } from '@/composables/services/useCardActivitiesService';
import type { User } from '@/components/common/users/types';
import type { ListStage } from '../lists/types';
import objectUtils from '@/utils/object';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import { useAuthStore } from '@/stores/auth';
import { type Content } from '@tiptap/vue-3';

const props = defineProps<{
  card: Card;
  showCloseButton?: boolean;
}>();
const emit = defineEmits(['click:close']);
const authStore = useAuthStore();
const cardCopy = ref<Card>({ ...props.card });
const comment = ref<Content>();
const isCommentEmpty = ref<boolean>();
const cardsService = useCardsService();
const cardActivitiesService = useCardActivitiesService();
const projectUsersService = useProjectUsersService();
const listStagesService = useListStagesService();
const snackbar = useSnackbarStore();

const updateCardMutation = cardsService.useUpdateCardMutation();
const usersQuery = projectUsersService.useProjectUsersQuery({
  projectId: authStore.project!.id,
});

const listId = computed(() => props.card.cardLists[0].listStage.listId);
const listStagesQuery = listStagesService.useGetListStagesQuery(listId.value);

const createActivityMutation = cardActivitiesService.useCreateActivityMutation({
  cardId: props.card.id,
});

const updateCardListStageMutation =
  cardsService.useUpdateCardListStageMutation();

const users = computed(() =>
  usersQuery.data.value?.map((projectUser) => projectUser.user)
);

const isCardLoading = computed(() => {
  return (
    updateCardMutation.isPending.value ||
    createActivityMutation.isPending.value ||
    updateCardListStageMutation.isPending.value
  );
});

const cardTitle = ref(cardCopy.value.title);
const debouncedTitle = useDebounce(cardTitle, 2000);
watch(debouncedTitle, () => {
  updateTitle();
});

const cardDescription = ref(cardCopy.value.description);
const debouncedDescription = useDebounce(cardDescription, 2000);
watch(debouncedDescription, () => {
  updateDescription();
});

const cardListStage = ref(cardCopy.value.cardLists[0].listStage);

function updateTitle() {
  const newTitle = cardTitle.value.trim();
  if (newTitle !== '' && newTitle !== props.card.title) {
    cardCopy.value.title = newTitle;
    updateCardMutation.mutateAsync(cardCopy.value).then(() => {
      snackbar.showSnackbar({
        message: 'Task title updated.',
        color: 'success',
        timeout: 2000,
      });
    });
  }
}

function updateDescription() {
  if (
    cardDescription.value &&
    (!cardCopy.value.description ||
      !objectUtils.isEqual(
        cardDescription.value as any,
        cardCopy.value.description as any
      ))
  ) {
    cardCopy.value.description = cardDescription.value;
    updateCardMutation.mutateAsync(cardCopy.value).then(() => {
      snackbar.showSnackbar({
        message: 'Task description updated.',
        color: 'success',
        timeout: 2000,
      });
    });
  }
}

function updateCardAssignees(assignees: User[]) {
  cardCopy.value.users = assignees;
  updateCardMutation.mutateAsync(cardCopy.value).then(() => {
    snackbar.showSnackbar({
      message: 'Task assignees updated.',
      color: 'success',
      timeout: 2000,
    });
  });
}
function createComment(content: ActivityContent) {
  if (!isCommentEmpty.value) {
    createActivityMutation
      .mutateAsync({
        cardId: props.card.id,
        type: ActivityType.COMMENT,
        content,
      })
      .then(() => {
        comment.value = undefined;
      })
      .catch((e) => {
        snackbar.showSnackbar({
          color: 'error',
          message:
            e.response.data.message ??
            'Something went wrong, please try again.',
          timeout: 5000,
        });
      });
  }
}

function updateCardDueAt(newDueAt: string) {
  if (props.card.dueAt !== newDueAt) {
    updateCardMutation.mutateAsync(cardCopy.value).catch((e) => {
      snackbar.showSnackbar({
        color: 'error',
        message:
          e.response.data.message ?? 'Something went wrong, please try again.',
        timeout: 5000,
      });
    });
  }
}

function updateCardListStage(listStage: ListStage) {
  updateCardListStageMutation
    .mutateAsync({
      cardId: cardCopy.value.id,
      cardListId: cardCopy.value.cardLists[0].id,
      listStageId: listStage.id,
    })
    .catch((e) => {
      snackbar.showSnackbar({
        color: 'error',
        message:
          e.response.data.message ?? 'Something went wrong, please try again.',
        timeout: 5000,
      });

      cardListStage.value = props.card.cardLists[0].listStage;
    });
}
</script>

<template>
  <v-card
    v-if="cardCopy"
    :loading="isCardLoading"
    class="d-flex flex-sm-row flex-column"
  >
    <template #loader="{ isActive }">
      <v-progress-linear
        indeterminate
        color="primary"
        height="2"
        :active="isActive"
        absolute
        location="top"
      />
    </template>
    <div class="base-card-content-wrapper pa-md-12 pa-6 flex-fill">
      <div class="base-card-content mx-auto">
        <div class="d-flex align-top">
          <base-editor-input
            v-model="cardTitle"
            placeholder="Task title"
            :heading="2"
            single-line
            class="flex-1-1-100 mt-1"
            editable
            disable-commands
          />
          <v-spacer />
          <div class="d-flex align-center ga-2">
            <v-btn
              v-if="props.showCloseButton"
              variant="text"
              icon="mdi-close"
              density="comfortable"
              color="default"
              @click="emit('click:close')"
            />
          </div>
        </div>
        <div class="mt-8">
          <base-editor-input
            v-model:json="cardDescription"
            placeholder="Enter description.. (/ for commands)"
            editable
          />
        </div>
        <v-divider class="my-8" />
        <v-card>
          <v-card-subtitle class="text-body-2 ps-1">Activity</v-card-subtitle>
          <v-card-text class="pa-0">
            <base-card-activity-timeline :card-id="cardCopy.id" />
            <base-card-comment-box
              v-model="comment"
              v-model:empty="isCommentEmpty"
              placeholder="Write comment.. (/ for commands)"
              @submit="createComment"
              class="ms-1"
            />
          </v-card-text>
        </v-card>
      </div>
    </div>
    <v-card class="border-s-thin h-100vh pa-4" width="400">
      <v-card-text class="ps-2 text-color-subtitle pb-0"
        >Properties</v-card-text
      >
      <v-card-text>
        <list-stage-selector
          v-model="cardListStage"
          :listStages="listStagesQuery.data.value ?? []"
          size="default"
          @update:model-value="updateCardListStage"
        />
        <base-user-selector
          v-model="cardCopy.users"
          :users="users ?? []"
          @update:model-value="updateCardAssignees"
          content-class="ms-n3 my-4"
          show-first-names
          label="Assign"
        />
        <base-date-picker
          class="text-body-2 ms-n2"
          label="Due date"
          icon="mdi-calendar"
          v-model="cardCopy.dueAt"
          @update:model-value="updateCardDueAt"
        />
      </v-card-text>
    </v-card>
  </v-card>
</template>

<style lang="scss">
.card-activities.v-timeline--vertical.v-timeline.v-timeline--side-end {
  .v-timeline-item .v-timeline-item__body {
    padding-inline-start: 12px;
    width: 100%;
  }
}
</style>

<style lang="scss" scoped>
.base-card-content-wrapper {
  max-height: 100vh;
  overflow: scroll;
}

.base-card-content {
  width: 600px;
  max-width: 100%;
}
</style>
