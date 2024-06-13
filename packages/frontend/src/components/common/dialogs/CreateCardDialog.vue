<script setup lang="ts">
import type {
  CardType,
  CreateCardDto,
} from '@/components/project-management/cards/types';
import {
  type List,
  type ListStage,
} from '@/components/project-management/lists/types';
import { useCardsService } from '@/composables/services/useCardsService';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';
import type { VForm } from 'vuetify/lib/components/index.mjs';
import BaseEditorInput from '../base/BaseEditor/BaseEditorInput.vue';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from './types';

const route = useRoute();
const authStore = useAuthStore();
const queryClient = useQueryClient();
const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();
const cardsService = useCardsService();
const projectUsersService = useProjectUsersService();
const createForm = ref<VForm>();
const isCreatingMore = ref(false);

const { data: users } = projectUsersService.useProjectUsersQuery({
  projectId: authStore.project!.id,
  select: (data) => data.map((pu) => pu.user),
});

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CREATE_CARD)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

const list = computed(() => {
  let list: List | undefined;

  if (currentDialog.value?.data && currentDialog.value.data?.list) {
    list = currentDialog.value.data.list;
  } else if (+route.params.listId) {
    list = queryClient.getQueryData(['lists', +route.params.listId]);
  }

  return list;
});

const listStages = computed(() => {
  let listStages: ListStage[] | undefined;

  if (currentDialog.value?.data && currentDialog.value.data?.listStages) {
    listStages = currentDialog.value.data.listStages;
  } else {
    listStages = list.value?.listStages ?? [];
  }

  return listStages ?? [];
});

const cardType = computed<CardType>(() => {
  if (currentDialog.value?.data && currentDialog.value.data?.type) {
    return currentDialog.value.data.type;
  } else {
    return list.value?.defaultCardType;
  }
});

const createCardMutation = cardsService.useCreateCardMutation();
const createCardDto = ref<CreateCardDto>({
  title: '',
  listId: currentDialog.value?.data?.listId ?? list.value?.id,
  listStage: currentDialog.value?.data?.listStage ?? listStages.value[0],
  users: currentDialog.value?.data?.users,
  type: cardType.value.id,
});

function closeDialog() {
  dialog.closeDialog(currentDialogIndex.value);
}

async function createCard() {
  if (
    createCardDto.value.title &&
    createCardDto.value.title.trim() !== '' &&
    createCardDto.value.listStage &&
    createCardDto.value.listId
  ) {
    createCardDto.value.listStageId = createCardDto.value.listStage.id;
    createCardMutation
      .mutateAsync(createCardDto.value)
      .then(() => {
        handlePostCreate();
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
  createCardDto.value.title = '';
  createCardDto.value.description = undefined;

  showSnackbar({
    message: `${cardType.value.name} created`,
    color: 'success',
    timeout: 2000,
  });

  if (!isCreatingMore.value) {
    closeDialog();
  }
}
</script>

<template>
  <v-card
    color="surface"
    elevation="24"
    :loading="createCardMutation.isPending.value"
  >
    <div class="d-flex align-center ps-0 pa-4">
      <v-card-subtitle>Create {{ cardType.name }}</v-card-subtitle>
      <v-spacer />
      <base-icon-btn icon="mdi-close" color="default" @click="closeDialog()" />
    </div>
    <v-form ref="createForm" @submit.prevent="createCard">
      <div class="pa-4 pt-0">
        <base-editor-input
          v-model="createCardDto.title"
          :placeholder="cardType.name + ' name'"
          autofocus
          :heading="3"
          single-line
          class="mb-3"
          editable
          disable-commands
        />
        <base-editor-input
          v-model:json="createCardDto.description"
          placeholder="Enter description.."
          editable
        />
      </div>
      <v-card-actions class="d-flex justify-start align-center py-0 px-4">
        <div class="d-flex ga-2 align-center">
          <list-stage-selector v-model="createCardDto.listStage" :listStages />
          <base-user-selector
            v-model="createCardDto.users"
            :users
            activator-hover-text="Assignee"
          />
          <base-date-picker
            v-model="createCardDto.startsAt"
            icon="mdi-calendar"
            class="text-caption"
            label="Start Date"
          />
          <base-date-picker
            v-model="createCardDto.dueAt"
            icon="mdi-calendar"
            class="text-caption"
            label="Due date"
          />
        </div>
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
          >Create {{ cardType.name }}</v-btn
        >
      </v-card-actions>
    </v-form>
  </v-card>
</template>
