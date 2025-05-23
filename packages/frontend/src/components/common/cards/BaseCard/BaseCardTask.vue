<script setup lang="ts">
import BaseEditorInput from '@/components/common/inputs/BaseEditor/BaseEditorInput.vue';
import ActivityTimeline from '../BaseCardActivityTimeline/ActivityTimeline.vue';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import BaseCardChildrenProgress from '../BaseCardChildrenProgress.vue';
import BaseCardChip from '../BaseCardChip.vue';
import BaseField from '../../../common/fields/BaseField.vue';
import BaseCardToolbar from './BaseCardToolbar.vue';

import { useCardActivitiesService } from '@/services/useCardActivitiesService';
import { useCardsService } from '@/services/useCardsService';

import { useSnackbarStore } from '@/stores/snackbar';
import { useStateStore } from '@/stores/state';
import { useDialogStore } from '@/stores/dialog';
import { useAuthStore } from '@/stores/auth';
import { useFieldQueryStore } from '@/stores/field.query';
import { useQueryStore } from '@/stores/query';

import { cloneDeep, lowerFirst } from 'lodash';
import { leaderKey } from '@/utils/keys';
import urlUtils from '@/utils/url';

import { useMentionNotifications } from '@/composables/useMentionNotifications';
import { useCard } from '@/composables/useCard';

import { type Content } from '@tiptap/vue-3';
import { DIALOGS } from '@/components/common/dialogs/types';
import {
  type CardType,
  ActivityType,
  type ActivityContent,
  type Card,
  type ListStage,
} from '@tillywork/shared';

const {
  card,
  hideBackButton = false,
  temporaryDrawer = false,
  closable = false,
} = defineProps<{
  card: Card;
  hideBackButton?: boolean;
  temporaryDrawer?: boolean;
  closable?: boolean;
}>();

const emit = defineEmits(['close']);

const cardCopy = ref<Card>(cloneDeep(card));
const descriptionInput = ref();
const cardListStage = ref(cardCopy.value.cardLists[0].listStage);

const { user } = storeToRefs(useAuthStore());
const { showSnackbar } = useSnackbarStore();
const { toggleInfoDrawer, toggleChildCards } = useStateStore();
const { areChildCardsExpanded, isInfoDrawerOpen, isInputFocused } = storeToRefs(
  useStateStore()
);
const dialog = useDialogStore();

const keys = useMagicKeys();
const { getNewMentions, notifyMentionedUser } = useMentionNotifications();
const { updateFieldValue, getCardTitle } = useCard();

const { useUpdateCardMutation, useUpdateCardListMutation } = useCardsService();
const { useCreateActivityMutation } = useCardActivitiesService();

const { mutateAsync: updateCard } = useUpdateCardMutation();

const { list, listStages } = useQueryStore();
const { titleField, descriptionField, fields } = storeToRefs(
  useFieldQueryStore()
);

const hasChildren = computed(() => card.type.hasChildren);
const cardTitle = computed(() => getCardTitle(card, titleField));

const cardTitleCopy = ref('');
const debouncedTitle = useDebounce(cardTitleCopy, 2000);

const cardDescription = ref<Content>();

const { mutateAsync: createActivity } = useCreateActivityMutation();
const { mutateAsync: updateCardList } = useUpdateCardListMutation();

const router = useRouter();

const canEditTitle = computed(
  () => titleField.value || card.type.titleTemplate
);

watch(
  () => card,
  (v) => {
    if (v) {
      cardCopy.value = cloneDeep(v);
      cardListStage.value = cardCopy.value.cardLists[0].listStage;
      initTitle();
      initDescription();
    }
  }
);

watch(
  descriptionField,
  (v) => {
    if (v) {
      initDescription();
    }
  },
  { immediate: true }
);

watch(cardTitle, initTitle, { immediate: true });

watch(debouncedTitle, () => {
  updateTitle();
});

watch(keys[[leaderKey, 'I'].join('+')], (v) => {
  if (v && !isInputFocused) {
    toggleInfoDrawer();
  }
});

function initTitle() {
  if (cardTitle.value) {
    cardTitleCopy.value = cardTitle.value;
    document.title = `${cardTitleCopy.value} - tillywork`;
  }
}

function initDescription() {
  if (descriptionField.value) {
    cardDescription.value = cardCopy.value.data[descriptionField.value.slug];
  }
}

function updateTitle() {
  const newTitle = cardTitleCopy.value.trim();
  if (newTitle !== '' && newTitle !== cardTitle.value) {
    if (titleField.value) {
      cardCopy.value.data[titleField.value.slug] = newTitle;
    } else if (card.type.titleTemplate) {
      const match = card.type.titleTemplate.match(/\{\{(\w+)\}\}/);
      if (match && match[1]) {
        const primaryField = match[1];
        cardCopy.value.data[primaryField] = newTitle;
      }
    }

    updateCard({
      id: cardCopy.value.id,
      data: cardCopy.value.data,
    }).then(() => {
      showSnackbar({
        message: 'Task title updated.',
        color: 'success',
        timeout: 2000,
      });
    });
  }
}

function createComment(content: ActivityContent) {
  createActivity({
    cardId: cardCopy.value.id,
    type: ActivityType.COMMENT,
    content,
  })
    .then(async () => {
      const newMentions = getNewMentions(content, {});
      for (const userId of newMentions) {
        await notifyMentionedUser({
          userId,
          mentionedBy: user.value!,
          cardType: { name: 'Comment' } as CardType,
          route: `${urlUtils.getCurrentHostUrl()}${
            router.currentRoute.value.path
          }`,
        });
      }
    })
    .catch((e) => {
      showSnackbar({
        color: 'error',
        message:
          e.response.data.message ?? 'Something went wrong, please try again.',
        timeout: 5000,
      });
    });
}

function updateCardListStage(card: Card, listStage: ListStage) {
  updateCardList({
    cardId: card.id,
    cardListId: card.cardLists[0].id,
    updateCardListDto: {
      listStageId: listStage.id,
    },
  }).catch((e) => {
    showSnackbar({
      color: 'error',
      message:
        e.response.data.message ?? 'Something went wrong, please try again.',
      timeout: 5000,
    });

    cardListStage.value = card.cardLists[0].listStage;
  });
}

function openCustomFieldsSettings() {
  router.push('/settings/custom-fields');
}

function openDescriptionFileDialog() {
  descriptionInput.value.openFileDialog();
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <template v-if="cardCopy">
    <v-card class="d-flex flex-column" min-height="100vh">
      <base-card-toolbar
        v-model="cardCopy"
        :list
        :hideBackButton
        :closable
        @close="handleClose"
      />
      <div class="base-card-content-wrapper pa-md-6 pa-6 align-start">
        <div class="base-card-content mx-auto">
          <div class="d-flex align-start pt-2">
            <template v-if="canEditTitle">
              <base-editor-input
                v-model:text="cardTitleCopy"
                :placeholder="`${card.type.name} ${
                  titleField ? titleField.name : 'name'
                }`"
                :heading="2"
                single-line
                class="flex-1-1-100"
                disable-commands
              />
            </template>
            <template v-else>
              <v-skeleton-loader
                type="heading"
                width="100%"
              ></v-skeleton-loader>
            </template>
            <v-spacer />
            <div class="d-flex align-center ga-2 mt-2">
              <base-icon-btn
                icon="mdi-dock-right"
                density="compact"
                size="default"
                @click="toggleInfoDrawer"
                v-tooltip="leaderKey + ' + I'"
              />
            </div>
          </div>

          <!-- Parent -->
          <div
            v-if="cardCopy.parent"
            class="d-flex ga-1 align-center text-caption"
          >
            Sub-{{ lowerFirst(cardCopy.type.name) }} of
            <base-card-chip :card="cardCopy.parent" class="ms-1" />
          </div>

          <div class="mt-4">
            <template v-if="descriptionField">
              <base-editor-input
                :model-value="cardDescription"
                ref="descriptionInput"
                placeholder="Enter description.. (/ for commands)"
                enable-collaboration
                doc-type="card"
                :doc-id="cardCopy.id"
              />
            </template>
            <template v-else>
              <v-skeleton-loader
                type="paragraph"
                width="100%"
              ></v-skeleton-loader>
            </template>
          </div>
          <div class="mt-8">
            <base-icon-btn
              icon="mdi-paperclip"
              rounded="circle"
              @click="openDescriptionFileDialog"
            />
          </div>

          <!-- Children -->
          <div
            class="text-body-3 user-select-none mt-4"
            v-if="hasChildren && titleField"
          >
            <template v-if="!cardCopy.children.length">
              <v-btn
                v-if="list"
                class="text-none"
                size="small"
                prepend-icon="mdi-plus"
                color="default"
                @click="
                  dialog.openDialog({
                    dialog: DIALOGS.CREATE_CARD,
                    data: {
                      type: cardCopy.type,
                      parent: cardCopy,
                      list,
                    },
                  })
                "
              >
                Add sub {{ lowerFirst(cardCopy.type.name) + 's' }}
              </v-btn>
            </template>
            <div
              class="cursor-pointer d-flex align-center pb-1"
              @click="toggleChildCards"
              v-else
            >
              <v-icon
                :icon="
                  areChildCardsExpanded
                    ? 'mdi-triangle-small-up'
                    : 'mdi-triangle-small-down'
                "
                size="22"
                style="margin-top: -2px"
              />
              <span class="ms-1"
                >Sub {{ lowerFirst(cardCopy.type.name) + 's' }}</span
              >
              <base-card-children-progress :card="cardCopy" class="ms-2" />
              <v-spacer />
              <base-icon-btn
                v-if="list"
                icon="mdi-plus"
                density="comfortable"
                @click.stop="
                  dialog.openDialog({
                    dialog: DIALOGS.CREATE_CARD,
                    data: {
                      type: cardCopy.type,
                      parent: cardCopy,
                      list,
                    },
                  })
                "
              />
            </div>

            <template v-if="areChildCardsExpanded">
              <v-divider v-if="cardCopy.children.length > 0" />

              <v-list class="user-select-none" :lines="false" nav>
                <v-list-item
                  v-for="child in cardCopy.children"
                  :key="child.id"
                  :to="'/card/' + child.id"
                >
                  <!-- Title -->
                  <v-list-item-title>
                    <list-stage-selector
                      v-model="child.cardLists[0].listStage"
                      :listStages="listStages ?? []"
                      size="default"
                      @update:model-value="
                        (listStage) => updateCardListStage(child, listStage as ListStage)
                      "
                      theme="icon"
                    />
                    {{ getCardTitle(child, titleField) }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </template>
          </div>

          <v-divider class="my-8" />

          <v-card>
            <v-card-subtitle class="text-body-3 ps-1">Activity</v-card-subtitle>
            <v-card-text class="pa-0">
              <activity-timeline :card @comment="createComment" />
            </v-card-text>
          </v-card>
        </div>
      </div>
      <v-navigation-drawer
        v-model="isInfoDrawerOpen"
        width="350"
        location="end"
        color="surface"
        :key="cardCopy.id"
        :temporary="temporaryDrawer"
      >
        <v-card color="transparent">
          <div class="pa-4 d-flex align-center">
            Properties
            <v-spacer />
            <base-icon-btn
              @click="openCustomFieldsSettings"
              icon="mdi-pencil"
              v-tooltip="'Edit fields'"
            />
          </div>
          <v-card-text>
            <div class="mb-4" v-if="listStages?.length">
              <p class="field-label text-caption font-weight-light mb-1">
                Stage
              </p>
              <list-stage-selector
                v-model="cardListStage"
                :listStages="listStages ?? []"
                size="default"
                @update:model-value="
                  (listStage) => updateCardListStage(cardCopy, listStage as ListStage)
                "
              />
            </div>
            <template v-if="fields">
              <template v-for="field in fields" :key="field.id">
                <div class="my-4">
                  <p class="field-label text-caption font-weight-light mb-1">
                    {{ field.name }}
                  </p>
                  <base-field
                    :field="field"
                    v-model="cardCopy.data[field.slug]"
                    @update:model-value="
                      (v: any) => updateFieldValue({ card: cardCopy, field, v })
                    "
                    flex-fill
                    text-field
                    type="field"
                  />
                </div>
              </template>
            </template>
          </v-card-text>
        </v-card>
      </v-navigation-drawer>
    </v-card>
  </template>
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
  max-height: calc(100vh - 48px);
  overflow: scroll;
}

.base-card-content {
  width: 700px;
  max-width: 100%;
}

.field-label {
  width: 100px;
  flex-shrink: 0;
}
</style>
