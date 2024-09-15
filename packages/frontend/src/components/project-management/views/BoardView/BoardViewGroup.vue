<script setup lang="ts">
import { type List, type ListGroup, type ListStage } from '../../lists/types';
import { useCardsService } from '@/services/useCardsService';
import type { TableSortOption } from '../types';
import type { ProjectUser } from '@/components/common/projects/types';
import type { Card } from '../../cards/types';
import draggable from 'vuedraggable';
import { useSnackbarStore } from '@/stores/snackbar';
import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';
import { useFields } from '@/composables/useFields';
import { useCard } from '@/composables/useCard';
import {
  ListGroupOptions,
  type QueryFilter,
  type ViewFilter,
  FieldTypes,
  type View,
} from '@tillywork/shared';
import { useListGroup } from '@/composables/useListGroup';
import BaseField from '@/components/common/fields/BaseField.vue';

const emit = defineEmits([
  'toggle:group',
  'card:delete',
  'card:update:stage',
  'card:update:order',
]);
const props = defineProps<{
  listGroup: ListGroup;
  listStages: ListStage[];
  view: View;
  list: List;
  projectUsers: ProjectUser[];
}>();
const isGroupCardsLoading = defineModel<boolean>('loading');

const cardsService = useCardsService();
const { showSnackbar } = useSnackbarStore();
const { openCreateCardDialog } = useListGroup(props);

const { updateFieldValue } = useCard();

const { titleField, assigneeField, pinnedFieldsWithoutAssignee } = useFields({
  cardTypeId: props.list.defaultCardType.id,
});

const groupCopy = ref(cloneDeep(props.listGroup));
const sortBy = computed<TableSortOption[]>(() =>
  props.view.options.sortBy ? [cloneDeep(props.view.options.sortBy)] : []
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

const hideCompleted = computed<boolean>(() => props.view.options.hideCompleted);
const hideChildren = computed<boolean>(() => props.view.options.hideChildren);

const cards = ref<Card[]>([]);
const total = ref(0);
const isDragging = ref(false);

const { fetchNextPage, isFetching, hasNextPage, refetch, data } =
  cardsService.useGetGroupCardsInfinite({
    listId: groupCopy.value.list.id,
    groupId: groupCopy.value.id,
    hideCompleted,
    hideChildren,
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

function handleUpdateCardStage(data: {
  cardId: number;
  cardListId: number;
  listStageId: number;
  order?: number;
}) {
  emit('card:update:stage', data);
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
        <template
          v-if="
            listGroup.type === ListGroupOptions.FIELD &&
            listGroup.field?.type === FieldTypes.USER
          "
        >
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

              <template v-if="titleField">
                <v-card-title
                  class="text-wrap text-body-3"
                  style="line-height: 1.5"
                >
                  {{ card.data[titleField.slug] }}
                </v-card-title>
              </template>
              <template v-else>
                <v-skeleton-loader type="text" class="mt-n2" />
              </template>

              <template #append>
                <template v-if="assigneeField">
                  <base-user-selector
                    :model-value="card.data[assigneeField.slug]"
                    :users
                    fill
                    return-id
                    return-string
                    @update:model-value="
                      (v: string[]) => updateFieldValue({
                        card, field: assigneeField, v
                      })
                    "
                    @click.stop
                  />
                </template>
              </template>
            </v-card-item>
            <v-card-actions
              class="px-2 py-1 align-end"
              style="min-height: fit-content"
            >
              <div class="d-flex flex-wrap flex-fill">
                <template v-if="pinnedFieldsWithoutAssignee">
                  <template
                    v-for="field in pinnedFieldsWithoutAssignee"
                    :key="field.slug"
                  >
                    <base-field
                      :field
                      no-label
                      :model-value="card.data[field.slug]"
                      @update:model-value="(v: string) => updateFieldValue({
                        card,
                        field,
                        v
                      })"
                    />
                  </template>
                </template>
                <template v-else>
                  <v-skeleton-loader
                    type="text"
                    class="mt-n2 flex-fill"
                    width="100%"
                  />
                </template>
              </div>

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
