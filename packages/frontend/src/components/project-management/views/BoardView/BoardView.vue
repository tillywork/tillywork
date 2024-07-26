<script setup lang="ts">
import type { View } from '../types';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import type { Card } from '../../cards/types';
import { type ListGroup } from '../../lists/types';
import { useListStagesService } from '@/composables/services/useListStagesService';
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import BoardViewGroup from './BoardViewGroup.vue';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAuthStore } from '@/stores/auth';
import BaseContextMenu from '@/components/common/base/BaseContextMenu.vue';

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
const { project } = storeToRefs(useAuthStore());

const listGroupsService = useListGroupsService();
const { mutateAsync: updateListGroup } =
  listGroupsService.useUpdateListGroupMutation();

const listsStagesService = useListStagesService();
const { data: listStages } = listsStagesService.useGetListStagesQuery({
  listId: props.view.listId,
});

const projectUsersService = useProjectUsersService();
const { data: projectUsers } = projectUsersService.useProjectUsersQuery({
  projectId: project.value!.id,
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

const contextMenuActions = [
  {
    value: 'delete',
    title: 'Delete',
    onClick: (card: Card) => emit('card:delete', card),
    props: { 'prepend-icon': 'mdi-delete', class: 'text-error' },
  },
  {
    value: 'nested',
    title: 'Nested',
    children: [
      {
        value: 'nested-1',
        title: 'Nested 1',
        onClick: console.log,
      },
      {
        value: 'nested-2',
        title: 'Nested 2',
        children: [
          {
            value: 'nested-2-1',
            title: 'Nested 2 - 1',
            onClick: console.log,
          },
        ],
      },
    ],
  },
];
const contextMenuActionRef = ref();
function openCardActions({ event, card }: { event: MouseEvent; card: Card }) {
  contextMenuActionRef.value.showMenu(event, card);
}
</script>

<template>
  <div class="board-container">
    <div class="board">
      <v-sheet
        class="board-groups d-flex ga-4 overflow-scroll px-2"
        color="transparent"
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
            @card:update:stage="handleUpdateCardStage"
            @card:update:due-date="handleUpdateDueDate"
            @card:update:assignees="handleUpdateAssignees"
            @card:update:order="handleUpdateCardOrder"
            @card:open:context-menu="openCardActions"
          />
        </template>
      </v-sheet>
    </div>
  </div>

  <base-context-menu
    ref="contextMenuActionRef"
    element-id="boardViewContextMenu"
    :items="contextMenuActions"
  />
</template>
