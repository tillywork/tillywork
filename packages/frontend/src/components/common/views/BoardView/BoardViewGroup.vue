<script setup lang="ts">
import draggable from 'vuedraggable';
import {
  ListGroupOptions,
  FieldTypes,
  type View,
  type Card,
  type ListGroup,
  type List,
} from '@tillywork/shared';

import { cloneDeep } from 'lodash';

import { useCardsService } from '@/services/useCardsService';

import { useListGroup } from '@/composables/useListGroup';

import BoardViewCard from './BoardViewCard.vue';

const props = defineProps<{
  listGroup: ListGroup;
  view: View;
  list: List;
}>();

const cards = ref<Card[]>([]);

const cardsService = useCardsService();
const {
  openCreateCardDialog,
  isDragging,
  onDragAdd,
  onDragEnd,
  onDragMove,
  onDragStart,
  onDragUpdate,
  queryConfig,
} = useListGroup({ props, cards });

const groupCopy = ref(cloneDeep(props.listGroup));

const total = ref(0);

const { fetchNextPage, isFetching, hasNextPage, refetch, data } =
  cardsService.useGetGroupCardsInfinite({
    listId: groupCopy.value.list.id,
    groupId: groupCopy.value.id,
    ...queryConfig.value,
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
</script>

<template>
  <v-card class="board-group" width="275" color="accent-lighten">
    <v-banner
      sticky
      lines="one"
      border="none"
      bg-color="accent-lighten"
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
        :delay="300"
        :delay-on-touch-only="true"
        :touch-start-threshold="5"
        item-key="id"
        animation="100"
        class="d-flex flex-column flex-0-0 ga-2 pa-2"
        group="cards"
        :style="`min-height: calc(100vh - (40px + 113px + 77px))`"
      >
        <template #item="{ element: card }">
          <board-view-card :card :list :isDragging />
        </template>
      </draggable>
    </v-infinite-scroll>
  </v-card>
</template>
