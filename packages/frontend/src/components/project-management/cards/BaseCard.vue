<script setup lang="ts">
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import type { User } from '@/components/common/users/types';
import { useCardActivitiesService } from '@/composables/services/useCardActivitiesService';
import { useCardsService } from '@/composables/services/useCardsService';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { type Content } from '@tiptap/vue-3';
import type { ListStage } from '../lists/types';
import BaseCardActivityTimeline from './BaseCardActivityTimeline.vue';
import BaseCardCommentBox from './BaseCardCommentBox.vue';
import { ActivityType, type ActivityContent, type Card } from './types';
import { cloneDeep } from 'lodash';
import { useFieldsService } from '@/composables/services/useFieldsService';
import { FieldTypes, type Field } from '../fields/types';
import { useStateStore } from '@/stores/state';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS, SettingsTabs } from '@/components/common/dialogs/types';
import BaseLabelSelector from '@/components/common/inputs/BaseLabelSelector.vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  card: Card;
  showCloseButton?: boolean;
}>();
const emit = defineEmits(['click:close']);
const { workspace, project } = storeToRefs(useAuthStore());
const cardCopy = ref<Card>(cloneDeep(props.card));
const fields = ref<Field[]>([]);
const comment = ref<Content>();
const isCommentEmpty = ref<boolean>();
const cardsService = useCardsService();
const cardActivitiesService = useCardActivitiesService();
const projectUsersService = useProjectUsersService();
const listStagesService = useListStagesService();
const { useFieldsQuery } = useFieldsService();
const snackbar = useSnackbarStore();
const stateStore = useStateStore();
const { isInfoDrawerOpen } = storeToRefs(stateStore);
const dialog = useDialogStore();

const { mutateAsync: updateCard, isPending: isUpdating } =
  cardsService.useUpdateCardMutation();
const usersQuery = projectUsersService.useProjectUsersQuery({
  projectId: project.value!.id,
});
const { data: workspaceFields } = useFieldsQuery({
  workspaceId: workspace.value!.id,
});

watch(
  workspaceFields,
  (v) => {
    if (v) {
      v.forEach(async (field) => {
        const exists = fields.value.find((f) => f.id === field.id);
        if (!exists) {
          fields.value = [...fields.value, field];
        }
      });
    }
  },
  { immediate: true }
);

const listId = computed(() => props.card.cardLists[0].listStage.listId);
const listStagesQuery = listStagesService.useGetListStagesQuery({
  listId: listId.value,
});

const createActivityMutation = cardActivitiesService.useCreateActivityMutation({
  cardId: props.card.id,
});

const updateCardListMutation = cardsService.useUpdateCardListMutation();

const users = computed(
  () =>
    usersQuery.data.value?.map((projectUser) => {
      const user = projectUser.user;
      return {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
      };
    }) ?? []
);

const isCardLoading = computed(() => {
  return (
    isUpdating.value ||
    createActivityMutation.isPending.value ||
    updateCardListMutation.isPending.value
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
    updateCard(cardCopy.value).then(() => {
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
    updateCard(cardCopy.value).then(() => {
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
  updateCard(cardCopy.value).then(() => {
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
    updateCard(cardCopy.value).catch((e) => {
      snackbar.showSnackbar({
        color: 'error',
        message:
          e.response.data.message ?? 'Something went wrong, please try again.',
        timeout: 5000,
      });
    });
  }
}

function updateCardStartsAt(newStartsAt: string) {
  if (props.card.startsAt !== newStartsAt) {
    updateCard(cardCopy.value).catch((e) => {
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
  updateCardListMutation
    .mutateAsync({
      cardId: cardCopy.value.id,
      cardListId: cardCopy.value.cardLists[0].id,
      updateCardListDto: {
        listStageId: listStage.id,
      },
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

function updateFieldValue({ field, v }: { field: Field; v: any }) {
  console.log(v);
  cardCopy.value = {
    ...cardCopy.value,
    data: {
      ...cardCopy.value.data,
      [field.id]: Array.isArray(v) ? (v.length && !!v[0] ? v : undefined) : v,
    },
  };

  updateCard(cardCopy.value).catch(() => {
    snackbar.showSnackbar({
      message: 'Something went wrong, please try again.',
      color: 'error',
    });
  });
}

function openSettingsDialog(activeTab: SettingsTabs) {
  dialog.openDialog({
    dialog: DIALOGS.SETTINGS,
    data: {
      activeTab,
    },
    options: {
      fullscreen: true,
    },
  });
}
</script>

<template>
  <v-card
    v-if="cardCopy"
    :loading="isCardLoading"
    class="d-flex flex-sm-row flex-column"
    min-height="100vh"
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
            <base-icon-btn
              icon="mdi-dock-right"
              density="compact"
              size="default"
              @click="stateStore.toggleInfoDrawer"
            />
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

        <template v-if="cardCopy.parentCard">
          <div class="flex">
            <v-icon>mdi-arrow-up</v-icon>
            <span>{{ cardCopy.parentCard.title }}</span>
          </div>
        </template>

        <div class="mt-8">
          <base-editor-input
            v-model:json="cardDescription"
            placeholder="Enter description.. (/ for commands)"
            editable
          />
        </div>
        <v-divider class="my-8" />

        <template v-if="cardCopy.childCards.length !== 0">
          <ul class="px-8">
            <li v-for="card in cardCopy.childCards" :key="card.id">
              {{ card.title }}
            </li>
          </ul>
          <v-divider class="my-8" />
        </template>

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
    <v-navigation-drawer v-model="isInfoDrawerOpen" width="350" location="end">
      <v-card>
        <div class="pa-4 d-flex align-center">
          Properties
          <v-spacer />
          <base-icon-btn
            @click="openSettingsDialog(SettingsTabs.FIELDS)"
            icon="mdi-pencil"
            v-tooltip="'Edit fields'"
          />
        </div>
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <p class="field-label text-caption">Stage</p>
            <list-stage-selector
              v-model="cardListStage"
              :listStages="listStagesQuery.data.value ?? []"
              size="default"
              @update:model-value="updateCardListStage"
            />
          </div>
          <div class="d-flex align-center my-4">
            <p class="field-label text-caption">Assigned to</p>
            <base-user-selector
              v-model="cardCopy.users"
              :users="users ?? []"
              @update:model-value="updateCardAssignees"
              label="Assign"
              size="24"
            />
          </div>
          <div class="d-flex align-center my-4">
            <p class="field-label text-caption">Start date</p>
            <base-date-picker
              class="text-body-2"
              label="Start date"
              icon="mdi-calendar"
              v-model="cardCopy.startsAt"
              @update:model-value="updateCardStartsAt"
            />
          </div>
          <div class="d-flex align-center my-4">
            <p class="field-label text-caption">Due date</p>
            <base-date-picker
              class="text-body-2"
              label="Due date"
              icon="mdi-calendar"
              v-model="cardCopy.dueAt"
              @update:model-value="updateCardDueAt"
            />
          </div>
          <template v-if="fields">
            <template v-for="field in fields" :key="field.id">
              <div class="d-flex align-center my-4">
                <p class="field-label text-caption">
                  {{ field.name }}
                </p>
                <template v-if="field.type === FieldTypes.TEXT">
                  <v-text-field
                    v-model="cardCopy.data[field.id]"
                    hide-details
                    :placeholder="field.name"
                    @update:model-value="(v) => updateFieldValue({ field, v })"
                    :prepend-inner-icon="field.icon"
                  />
                </template>
                <template v-else-if="field.type === FieldTypes.DROPDOWN">
                  <v-combobox
                    v-model="cardCopy.data[field.id]"
                    :items="field.items"
                    item-title="item"
                    item-value="item"
                    hide-details
                    :placeholder="field.name"
                    :prepend-inner-icon="field.icon"
                    :multiple="field.multiple"
                    autocomplete="off"
                    auto-select-first
                    @update:model-value="
                      (v) =>
                        updateFieldValue({
                          field,
                          v: Array.isArray(v)
                            ? v.map((item) => (item.item ? item.item : item))
                            : [v.item],
                        })
                    "
                  />
                </template>
                <template v-else-if="field.type === FieldTypes.LABEL">
                  <base-label-selector
                    v-model="cardCopy.data[field.id]"
                    :items="field.items"
                    :icon="field.icon"
                    :placeholder="field.name"
                    :multiple="field.multiple"
                    @update:model-value="
                      (v) =>
                        updateFieldValue({
                          field,
                          v,
                        })
                    "
                  />
                </template>
                <template v-else-if="field.type === FieldTypes.DATE">
                  <base-date-picker
                    v-model="cardCopy.data[field.id]"
                    class="text-body-2"
                    :icon="field.icon ?? 'mdi-calendar'"
                    :label="field.name"
                    @update:model-value="
                      (v: string | string[]) =>
                        updateFieldValue({
                          field,
                          v,
                        })
                    "
                  />
                </template>
                <template v-else-if="field.type === FieldTypes.USER">
                  <base-user-selector
                    :model-value="cardCopy.data[field.id]?.map((userIdAsString: string) => +userIdAsString)"
                    :users
                    :label="field.name"
                    return-id
                    :icon="field.icon"
                    size="24"
                    @update:model-value="
                      (users: number[]) =>
                        updateFieldValue({
                          field,
                          v: users.map((userIdAsNumber) => userIdAsNumber.toString()),
                        })
                    "
                  />
                </template>
              </div>
            </template>
          </template>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
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
  width: 650px;
  max-width: 100%;
}

.field-label {
  width: 100px;
  flex-shrink: 0;
}
</style>
