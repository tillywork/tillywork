<script setup lang="ts">
import { useCardsService } from '@/services/useCardsService';
import { useSnackbarStore } from '@/stores/snackbar';
import type { VForm } from 'vuetify/lib/components/index.mjs';
import BaseEditorInput from '../../base/BaseEditor/BaseEditorInput.vue';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '../types';
import BaseListSelector from '../../inputs/BaseListSelector.vue';
import { cloneDeep } from 'lodash';
import { useAuthStore } from '@/stores/auth';
import BaseCardChip from '@/components/project-management/cards/BaseCardChip.vue';
import { leaderKey } from '@/utils/keyboard';
import { useFields } from '@/composables/useFields';
import BaseField from '../../fields/BaseField.vue';
import posthog from 'posthog-js';
import {
  type CardType,
  type CreateCardDto,
  type List,
} from '@tillywork/shared';

const dialog = useDialogStore();
const { workspace } = storeToRefs(useAuthStore());
const { showSnackbar } = useSnackbarStore();

const { meta, ctrl, enter } = useMagicKeys();

const createForm = ref<VForm>();
const isCreatingMore = ref(false);
const descriptionEditor = ref();

const cardsService = useCardsService();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CREATE_CARD)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

const list = computed(() => currentDialog.value?.data?.list);

const cardType = computed<CardType>(() => {
  if (currentDialog.value?.data && currentDialog.value.data?.type) {
    return currentDialog.value.data.type;
  } else if (list.value) {
    return list.value?.defaultCardType;
  } else {
    return workspace.value?.defaultCardType;
  }
});

const { pinnedFields, titleField } = useFields({
  cardTypeId: cardType.value.id,
  listId: list.value.id,
});

const createCardMutation = cardsService.useCreateCardMutation();
const createCardDto = ref<CreateCardDto>({
  data: {
    ...(currentDialog.value.data.data ?? {}),
  },
  listId: currentDialog.value?.data?.listId ?? list.value?.id,
  listStage: currentDialog.value?.data?.listStage ?? list.value?.listStages[0],
  type: cardType.value?.id,
  parent: currentDialog.value?.data?.parent,
  workspaceId: workspace.value!.id,
});

const selectedList = ref<List>(cloneDeep(list.value));
watch(selectedList, (v) => {
  if (v) {
    createCardDto.value.listStage = v.listStages[0];
    createCardDto.value.listId = v.id;
  }
});

function closeDialog() {
  dialog.closeDialog(currentDialogIndex.value);
}

async function createCard() {
  if (
    createCardDto.value.data[titleField.value!.slug] &&
    createCardDto.value.data[titleField.value!.slug].trim() !== '' &&
    createCardDto.value.listId
  ) {
    createCardDto.value.listStageId = createCardDto.value.listStage?.id;
    createCardMutation
      .mutateAsync(createCardDto.value)
      .then((card) => {
        handlePostCreate();
        posthog.capture('card_created', { id: card.id });
      })
      .catch(() => {
        showSnackbar({
          message: 'Something went wrong, please try again.',
          color: 'error',
          timeout: 5000,
        });
      });
  }
}

/**
 * Reset title and description fields.
 * If create more is on, don't close the dialog.
 */
function handlePostCreate() {
  createCardDto.value.data[titleField.value!.slug] = '';
  createCardDto.value.data.description = undefined;

  showSnackbar({
    message: `${cardType.value?.name} created`,
    color: 'success',
    timeout: 2000,
  });

  if (!isCreatingMore.value) {
    closeDialog();
  }
}

function openBaseEditorFileDialog() {
  descriptionEditor.value.openFileDialog();
}

watch([meta, ctrl, enter], ([isMetaPressed, isCtrlPressed, isEnterPressed]) => {
  if (isEnterPressed && (isMetaPressed || isCtrlPressed)) {
    createCard();
  }
});
</script>

<template>
  <v-card
    color="surface"
    elevation="24"
    :loading="createCardMutation.isPending.value"
  >
    <div class="d-flex align-center ps-0 pa-4">
      <v-card-subtitle class="d-flex align-center">
        <base-list-selector v-model="selectedList" />
        <template v-if="createCardDto.parent">
          <v-icon icon="mdi-arrow-right-thin" class="mx-1" />
          <base-card-chip :card="createCardDto.parent" />
        </template>
        <v-icon icon="mdi-arrow-right-thin" class="mx-1" />
        Create {{ cardType.name }}
      </v-card-subtitle>
      <v-spacer />
      <base-icon-btn icon="mdi-close" color="default" @click="closeDialog()" />
    </div>
    <v-form ref="createForm" @submit.prevent="createCard()">
      <div class="px-4 pb-2">
        <base-editor-input
          v-if="titleField"
          v-model="createCardDto.data[titleField.slug]"
          :placeholder="cardType.name + ` ${titleField.name.toLowerCase()}`"
          autofocus
          :heading="3"
          single-line
          class="mb-2"
          editable
          disable-commands
        />
        <base-editor-input
          ref="descriptionEditor"
          v-model:json="createCardDto.data.description"
          placeholder="Enter description.."
          editable
          min-height="80px"
        />

        <div class="d-flex ga-1 align-center">
          <list-stage-selector
            v-if="list?.listStages.length"
            v-model="createCardDto.listStage"
            :listStages="list?.listStages ?? []"
          />

          <template v-for="field in pinnedFields" :key="field.id">
            <base-field
              :field="field"
              v-model="createCardDto.data[field.slug]"
              no-label
            />
          </template>
        </div>
      </div>
      <v-card-actions
        class="d-flex justify-start align-center py-0 px-4 border-t-thin"
      >
        <base-icon-btn
          icon="mdi-paperclip"
          rounded="circle"
          @click="openBaseEditorFileDialog"
        />
        <v-spacer />
        <v-switch v-model="isCreatingMore" hide-details inset>
          <template #label>
            <span class="text-caption">Create more</span>
          </template>
        </v-switch>

        <v-btn
          density="comfortable"
          variant="flat"
          class="text-caption px-4 ms-4"
          type="submit"
          :loading="createCardMutation.isPending.value"
        >
          Create {{ cardType.name }}
          <template #append>
            <div class="d-flex align-center ga-1">
              <v-icon
                v-if="leaderKey === 'Cmd'"
                icon="mdi-apple-keyboard-command"
              />
              <span v-else class="text-xs">Ctrl</span>
              <v-icon icon="mdi-keyboard-return" />
            </div>
          </template>
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
