<script setup lang="ts">
import BaseEditorInput from '../base/BaseEditor/BaseEditorInput.vue';
import BaseIconBtn from '../base/BaseIconBtn.vue';
import ListStageSelector from '../inputs/ListStageSelector.vue';
import BaseUserSelector from '../inputs/BaseUserSelector.vue';
import BaseDatePicker from '../inputs/BaseDatePicker.vue';
import type { CreateCardDto } from '@/components/project-management/cards/types';
import { ref } from 'vue';
import { useDialog } from '@/composables/useDialog';
import { type List } from '@/components/project-management/lists/types';
import { useQueryClient } from '@tanstack/vue-query';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import type { User } from '../users/types';
import type { UsersData } from '@/composables/services/useUsersService';
import type { VForm } from 'vuetify/lib/components/index.mjs';
import { useCardsService } from '@/composables/services/useCardsService';
import { useSnackbarStore } from '@/stores/snackbar';

const route = useRoute();
const queryClient = useQueryClient();
const dialog = useDialog();
const snackbarStore = useSnackbarStore();
const cardsService = useCardsService();
const createForm = ref<VForm>();
const isCreatingMore = ref(false);

const list = computed(() => {
  let list: List | undefined;

  if (dialog.data && dialog.data.list) {
    list = dialog.data.list;
  } else if (+route.params.listId) {
    list = queryClient.getQueryData(['list', +route.params.listId]);
  }

  console.log(dialog.data);

  return list;
});

const users = computed(() => {
  let users: User[] = [];
  const cached: UsersData | undefined = queryClient.getQueryData(['users']);
  if (cached) {
    users = cached.users;
  }
  return users;
});

const createCardMutation = cardsService.useCreateCardMutation();
const createCardDto = ref<CreateCardDto>({
  title: '',
  listId: list.value?.id,
  listStage: dialog.data.listStage ?? list.value?.listStages[0],
  users: dialog.data.users,
});

function closeDialog() {
  dialog.closeDialog();
}

async function createCard() {
  if (
    createCardDto.value.title &&
    createCardDto.value.title.trim() !== '' &&
    createCardDto.value.listStage &&
    createCardDto.value.listId
  ) {
    createCardDto.value.listStageId = createCardDto.value.listStage.id;
    createCardMutation.mutateAsync(createCardDto.value).then(() => {
      handlePostCreate();
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

  snackbarStore.showSnackbar({
    message: `Task created`,
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
      <v-card-subtitle>Create task</v-card-subtitle>
      <v-spacer />
      <base-icon-btn icon="mdi-close" color="default" @click="closeDialog()" />
    </div>
    <v-form ref="createForm" @submit.prevent="createCard">
      <div class="pa-4 pt-0">
        <base-editor-input
          v-model="createCardDto.title"
          placeholder="Task title"
          autofocus
          :heading="3"
          single-line
          class="mb-3"
          editable
        />
        <base-editor-input
          v-model:json="createCardDto.description"
          placeholder="Enter description.."
          editable
        />
      </div>
      <v-card-actions class="d-flex justify-start align-center py-0 px-4">
        <div class="d-flex ga-2 align-center">
          <list-stage-selector
            v-model="createCardDto.listStage"
            :listStages="list?.listStages ?? []"
          />
          <base-user-selector
            v-model="createCardDto.users"
            :users
            activator-hover-text="Assignee"
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
          >Create task</v-btn
        >
      </v-card-actions>
    </v-form>
  </v-card>
</template>
