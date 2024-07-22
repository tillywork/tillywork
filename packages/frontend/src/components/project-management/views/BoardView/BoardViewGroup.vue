<script setup lang="ts">
import {
  ListGroupOptions,
  type ListGroup,
  type ListStage,
} from '../../lists/types';
import { useCardsService } from '@/composables/services/useCardsService';
import type { TableSortOption, View } from '../types';
import type { ProjectUser } from '@/components/common/projects/types';
import { DIALOGS } from '@/components/common/dialogs/types';
import type { Card } from '../../cards/types';
import draggable from 'vuedraggable';
import type { User } from '@/components/common/users/types';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import type { QueryFilter, ViewFilter } from '../../filters/types';
import { useDialogStore } from '@/stores/dialog';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';

const emit = defineEmits([
  'toggle:group',
  'card:delete',
  'card:update:stage',
  'card:update:due-date',
  'card:update:assignees',
  'card:update:order',
]);
const props = defineProps<{
  listGroup: ListGroup;
  listStages: ListStage[];
  view: View;
  projectUsers: ProjectUser[];
}>();
const cardMenuOpen = ref<Card | null>();
const isGroupCardsLoading = defineModel<boolean>('loading');

const dialog = useDialogStore();
const cardsService = useCardsService();
const { showSnackbar } = useSnackbarStore();

const groupCopy = ref(cloneDeep(props.listGroup));
const sortBy = computed<TableSortOption[]>(() =>
  props.view.sortBy ? [cloneDeep(props.view.sortBy)] : []
);

const isDraggingDisabled = computed(() => {
  return sortBy.value && sortBy.value.length > 0;
});

const users = computed(() =>
  props.projectUsers.map((projectUser) => projectUser.user)
);

const filters = computed<QueryFilter>(() => {
  if (props.view.filters) {
    const viewFilters = {
      where: {
        and: [
          ...(cloneDeep((props.view.filters as ViewFilter).where.quick?.and) ??
            []),
          ...(cloneDeep(
            (props.view.filters as ViewFilter).where.advanced?.and
          ) ?? []),
        ],
      },
    };

    return objectUtils.deepMergeObjects(
      viewFilters,
      cloneDeep(props.listGroup.filter) ?? {}
    );
  } else {
    return props.listGroup.filter ?? {};
  }
});

const ignoreCompleted = computed<boolean>(() => props.view.ignoreCompleted);
const ignoreChildren = computed<boolean>(() => props.view.ignoreChildren);

const cards = ref<Card[]>([]);
const total = ref(0);
const isDragging = ref(false);

const { fetchNextPage, isFetching, hasNextPage, refetch, data } =
  cardsService.useGetGroupCardsInfinite({
    listId: groupCopy.value.listId,
    groupId: groupCopy.value.id,
    ignoreCompleted,
    ignoreChildren,
    filters,
    sortBy,
  });

async function handleGroupCardsLoad({
  done,
}: {
  done: (status?: any) => void;
}) {
  if (!isFetching.value && !isDragging.value) {
    fetchNextPage();

    if (hasNextPage.value) {
      done('ok');
    } else {
      done('empty');
    }
  } else {
    done('ok');
  }
}

function toggleGroupExpansion(listGroup: ListGroup) {
  emit('toggle:group', listGroup);
}

function openCreateCardDialog(listGroup: ListGroup) {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_CARD,
    data: {
      listId: listGroup.listId,
      listStage: getCurrentStage(listGroup),
      users: getCurrentAssignee(listGroup),
      listStages: props.listStages,
    },
  });
}

function getCurrentStage(group: ListGroup) {
  let stage: ListStage | undefined;

  if (group.type === ListGroupOptions.LIST_STAGE) {
    stage = props.listStages.find((stage) => {
      return stage.id == group.entityId;
    });
  }

  return stage ? { ...stage } : undefined;
}

function getCurrentAssignee(group: ListGroup) {
  let user: User | undefined;

  if (group.type === ListGroupOptions.ASSIGNEES) {
    user = props.projectUsers.find((user: ProjectUser) => {
      return user.user.id == group.entityId;
    })?.user;
  }

  return user ? [user] : undefined;
}

function onDragMove() {
  if (isDraggingDisabled.value) {
    isDragging.value = false;
    return false;
  }
}

function onDragStart() {
  isDragging.value = true;

  if (isDraggingDisabled.value) {
    showSnackbar({
      message: 'Dragging cards is only enabled when sorting is disabled.',
      color: 'error',
      timeout: 5000,
    });
  }
}

function onDragEnd() {
  isDragging.value = false;
}

function onDragUpdate(event: any) {
  const { newIndex } = event;
  isDragging.value = false;

  const previousCard = cards.value[newIndex - 1];
  const currentCard = cards.value[newIndex];
  const nextCard = cards.value[newIndex + 1];

  handleUpdateCardOrder({
    currentCard,
    previousCard,
    nextCard,
  });
}

function onDragAdd(event: any) {
  const { newIndex } = event;
  isDragging.value = false;

  const previousCard = cards.value[newIndex - 1];
  const currentCard = cards.value[newIndex];
  const nextCard = cards.value[newIndex + 1];

  const newOrder = cardsService.calculateCardOrder({ previousCard, nextCard });

  handleUpdateCardStage({
    cardId: currentCard.id,
    cardListId: currentCard.cardLists[0].id,
    listStageId: props.listGroup.entityId!,
    order: newOrder,
  });
}

function handleUpdateCardOrder(data: {
  currentCard: Card;
  previousCard?: Card;
  nextCard?: Card;
}) {
  emit('card:update:order', data);
}

function handleCardMenuClick({
  card,
  isOpen,
}: {
  card: Card;
  isOpen: boolean;
}) {
  if (isOpen) {
    cardMenuOpen.value = card;
  } else {
    cardMenuOpen.value = null;
  }
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

function handleUserSelection({ users, card }: { users: User[]; card: Card }) {
  emit('card:update:assignees', {
    users,
    card,
  });
}

watch(
  data,
  (v) => {
    if (v) {
      cards.value = v?.pages.map((page) => page.cards).flat() ?? [];
      total.value = v?.pages[0].total ?? 0;
    }
  },
  { immediate: true }
);

watch(
  () => props.view,
  () => {
    refetch();
  },
  { deep: true }
);

watchEffect(() => {
  if (isFetching.value) {
    isGroupCardsLoading.value = true;
  } else {
    isGroupCardsLoading.value = false;
  }
});
</script>

<template>
  <v-card class="board-group" width="275" color="accent">
    <v-banner
      sticky
      lines="one"
      border="none"
      bg-color="accent"
      style="z-index: 10"
    >
      <div>
        <template v-if="listGroup.type === ListGroupOptions.ASSIGNEES">
          <base-avatar
            :photo="listGroup.icon"
            :text="listGroup.name"
            size="x-small"
          />
        </template>
        <template v-else>
          <v-icon :color="listGroup.color" size="small">
            {{ listGroup.icon ?? 'mdi-circle-slice-8' }}
          </v-icon>
        </template>
        <span class="ms-2">
          {{ listGroup.name }}
          <span class="ms-2 text-caption text-color-subtitle">
            {{ total }}
          </span>
        </span>
      </div>
      <v-spacer />
      <base-icon-btn icon="mdi-plus" @click="openCreateCardDialog(listGroup)" />
    </v-banner>
    <v-infinite-scroll
      @load="handleGroupCardsLoad"
      :height="`calc(100vh - 205px${
        $vuetify.display.mdAndDown ? ' - 40px' : ''
      })`"
    >
      <template #empty></template>
      <template #loading></template>
      <draggable
        v-model="cards"
        :move="onDragMove"
        @start="onDragStart"
        @end="onDragEnd"
        @add="onDragAdd"
        @update="onDragUpdate"
        item-key="id"
        animation="100"
        class="d-flex flex-column flex-0-0 ga-2 pa-2"
        group="cards"
        :style="`min-height: calc(100vh - (40px + 113px + 77px))`"
      >
        <template #item="{ element: card }">
          <v-card
            class="board-card"
            :to="`/pm/card/${card.id}`"
            :ripple="false"
          >
            <v-card-item class="pa-2 align-start">
              <template #prepend>
                <list-stage-selector
                  :model-value="card.cardLists[0].listStage"
                  theme="icon"
                  rounded="circle"
                  :list-stages="listStages ?? []"
                  @update:modelValue="
                    (modelValue: ListStage) =>
                    handleUpdateCardStage({
                        cardId: card.id,
                        cardListId: card.cardLists[0].id,
                        listStageId: modelValue.id,
                    })
                  "
                  @click.prevent
                />
              </template>

              <v-card-title
                class="text-wrap text-body-2"
                style="line-height: 1.2"
              >
                {{ card.title }}
              </v-card-title>

              <template #append>
                <base-user-selector
                  :model-value="card.users"
                  :users
                  fill
                  @update:model-value="
                      (users: User[]) => handleUserSelection({
                         users, card
                      })
                    "
                  @click.stop
                />
              </template>
            </v-card-item>
            <v-card-actions
              class="px-2 py-1 align-end"
              style="min-height: fit-content"
            >
              <base-date-picker
                :model-value="card.dueAt"
                @update:model-value="(newValue: string) => handleUpdateDueDate({
                      card: card,
                      newDueDate: newValue ?? null,
                    })"
                class="text-caption"
                :color="
                  card.cardLists[0].listStage.isCompleted
                    ? 'success'
                    : undefined
                "
                label="Set due date"
                @click.prevent
              />

              <v-spacer />
              <!-- Progress -->
              <base-card-children-progress
                v-if="card.children.length > 0"
                :card
                border="thin"
                density="compact"
                style="padding: 2px !important"
                class="text-caption mb-1"
              />
            </v-card-actions>
          </v-card>
        </template>
      </draggable>
    </v-infinite-scroll>
  </v-card>
</template>

<style lang="scss">
.board-group {
  .v-btn:hover > .v-btn__overlay {
    opacity: 0.1;
  }
  .v-card:hover > .v-card__overlay {
    opacity: 0.075;
  }
}
</style>
