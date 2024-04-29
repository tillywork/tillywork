<script setup lang="ts">
import { type Card } from './types';
import { type Prop, PropTypes } from '../props/types';
import BaseCardProperty from './BaseCardProperty.vue';
import { computed, ref } from 'vue';
import { watch } from 'vue';
import { useTextareaAutosize } from '@vueuse/core';
import { validation } from '@/utils/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useCardsService } from '@/composables/services/useCardsService';
import { useSnackbarStore } from '@/stores/snackbar';
import { useUsersService } from '@/composables/services/useUsersService';

const props = defineProps<{
  showCloseButton?: boolean;
}>();
const emit = defineEmits(['click:close']);

const card = defineModel<Card>();
const cardCopy = ref<Card>();
const cardsService = useCardsService();
const usersService = useUsersService();
const snackbar = useSnackbarStore();

const queryClient = useQueryClient();
const updateCardMutation = useMutation({
  mutationFn: updateCard,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['cards'] });
  },
});
const usersQuery = useQuery({
  queryKey: ['users'],
  queryFn: usersService.getUsers,
});

const { textarea, input: cardTitle } = useTextareaAutosize();

const listId = computed(() => card.value?.cardLists[0].listId);
const stageModel = computed(() => {
  return {
    listId: listId.value,
    name: 'Stage',
    type: PropTypes.STAGE,
    required: true,
  } as Prop;
});
const descriptionModel = computed(() => {
  return {
    listId: listId.value,
    name: 'Description',
    type: PropTypes.TEXT_AREA,
    required: false,
  } as Prop;
});
const assigneesModel = computed(() => {
  return {
    listId: listId.value,
    name: 'Assignee',
    type: PropTypes.USER,
    required: false,
  } as Prop;
});
const dueDateModel = computed(() => {
  return {
    listId: listId.value,
    name: 'Due Date',
    type: PropTypes.DATE,
    required: false,
  } as Prop;
});
const isCardLoading = computed(() => {
  return updateCardMutation.isPending.value;
});

watch(
  card,
  (newCard) => {
    console.log(newCard);
    cardCopy.value = {
      ...newCard,
    } as Card;
    cardTitle.value = cardCopy.value.title;
  },
  { deep: true, immediate: true }
);

function updateTitle(event: Event) {
  (event.target as HTMLInputElement)?.blur();
  const newTitle = cardTitle.value.trim();
  if (newTitle !== cardCopy.value?.title) {
    const valid = validation.rules.required(newTitle);
    if (valid === true) {
      const card = {
        ...cardCopy.value,
        title: newTitle,
      } as Card;
      updateCardMutation.mutate(card);
    } else {
      cardTitle.value = cardCopy.value?.title ?? '';
      snackbar.showSnackbar({
        message: valid,
        color: 'error',
        timeout: 2000,
      });
    }
  }
}

async function updateCard(card: Card) {
  const result = await cardsService.updateCard(card);
  snackbar.showSnackbar({
    message: `Card updated successfully`,
    color: 'success',
    timeout: 2500,
  });
  return result;
}
</script>

<template>
  <v-card v-if="cardCopy">
    <v-progress-linear
      indeterminate
      color="primary"
      height="2"
      :active="isCardLoading"
      absolute
      location="top"
    />
    <div class="d-flex align-top py-4 px-7" color="transparent">
      <textarea
        ref="textarea"
        v-model="cardTitle"
        class="base-card-textarea text-h5 w-100 mt-1 me-4"
        @keydown.enter="updateTitle"
      ></textarea>
      <v-spacer />
      <div class="d-flex align-center ga-2">
        <v-btn
          variant="text"
          icon="mdi-dots-vertical"
          density="comfortable"
          color="default"
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
    <div class="d-flex flex-column px-4">
      <v-container fluid>
        <base-card-property
          v-model:prop="assigneesModel"
          v-model:value="cardCopy.users"
          :users="usersQuery.data.value?.users"
        />
        <base-card-property
          v-model:prop="stageModel"
          v-model:value="cardCopy.cardLists[0].listStage"
          v-if="cardCopy.cardLists"
        />
        <base-card-property
          v-model:prop="dueDateModel"
          v-model:value="cardCopy.createdAt"
        />
        <base-card-property
          v-model:prop="descriptionModel"
          v-model:value="cardCopy.description"
        />
      </v-container>
    </div>
  </v-card>
</template>

<style lang="scss">
.base-card-textarea {
  border: none;
  resize: none; /*remove the resize handle on the bottom right*/
}
</style>
