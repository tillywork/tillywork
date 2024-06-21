<script setup lang="ts">
import type { View } from '../types';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import type { Card } from '../../cards/types';
import { type ListGroup } from '../../lists/types';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import { useAuthStore } from '@/stores/auth';
import BoardViewGroup from './BoardViewGroup.vue';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';

const isLoading = defineModel<boolean>('loading');

const props = defineProps<{
  view: View;
  listGroups: ListGroup[];
}>();

const emit = defineEmits([
  'card:delete',
  'submit',
  'load',
  'card:update:stage',
  'card:update:due-date',
  'card:update:assignees',
  'card:update:order',
]);

const { showSnackbar } = useSnackbarStore();
const authStore = useAuthStore();

const listGroupsService = useListGroupsService();
const { mutateAsync: updateListGroup } =
  listGroupsService.useUpdateListGroupMutation();

const listsStagesService = useListStagesService();
const { data: listStages } = listsStagesService.useGetListStagesQuery({
  listId: props.view.listId,
});

const projectUsersService = useProjectUsersService();
const { data: projectUsers } = projectUsersService.useProjectUsersQuery({
  projectId: authStore.project!.id,
});

function toggleGroupExpansion(listGroup: ListGroup) {
  updateListGroup({
    ...listGroup,
    isExpanded: !listGroup.isExpanded,
  })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function handleUpdateAssignees({ users, card }: { users: User[]; card: Card }) {
  emit('card:update:assignees', {
    users,
    card,
  });
}

function handleUpdateDueDate({
  newDueDate,
  card,
}: {
  newDueDate: string;
  card: Card;
}) {
  emit('card:update:due-date', {
    newDueDate,
    card,
  });
}

function handleDeleteCard(card: Card) {
  emit('card:delete', card);
}

function handleUpdateCardStage(data: {
  cardId: number;
  cardListId: number;
  listStageId: number;
  order?: number;
}) {
  emit('card:update:stage', data);
}

function handleUpdateCardOrder(data: {
  currentCard: Card;
  previousCard?: Card;
  nextCard?: Card;
}) {
  emit('card:update:order', data);
}
</script>

<template>
  <div class="board-container">
    <div class="board">
      <v-sheet
        class="board-groups d-flex ga-4 overflow-scroll px-2"
        color="transparent"
        height="calc(100vh - (40px + 120px))"
        width="fit-content"
      >
        <template v-for="listGroup in listGroups" :key="listGroup.id">
          <board-view-group
            v-model:loading="isLoading"
            :list-group="listGroup"
            :list-stages="listStages ?? []"
            :view
            :project-users="projectUsers ?? []"
            @toggle:group="toggleGroupExpansion"
            @card:delete="handleDeleteCard"
            @card:update:stage="handleUpdateCardStage"
            @card:update:due-date="handleUpdateDueDate"
            @card:update:assignees="handleUpdateAssignees"
            @card:update:order="handleUpdateCardOrder"
          />
        </template>
      </v-sheet>
    </div>
  </div>
</template>
