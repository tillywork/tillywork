<script setup lang="ts">
import { type ListGroup } from '../lists/types';
import {
  useQueryClient,
  type QueryObserverResult,
  useMutation,
  useQuery,
  useInfiniteQuery,
} from '@tanstack/vue-query';
import TableView from '@/components/project-management/views/TableView/TableView.vue';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import BaseUserSelector from '@/components/common/inputs/BaseUserSelector.vue';
import { type ColumnDef, type Row } from '@tanstack/vue-table';
import type { Card, CreateCardDto } from '../cards/types';
import type { User } from '@/components/common/users/types';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCardsService } from '@/composables/services/useCardsService';
import { ref } from 'vue';
import { useUsersService } from '@/composables/services/useUsersService';
import { type PaginationParams } from './TableView/types';
import { useListStagesService } from '@/composables/services/useListStagesService';
import BaseDatePicker from '@/components/common/inputs/BaseDatePicker.vue';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import { ListGroupOptions } from '../lists/types';
import BaseUserPhoto from '@/components/common/users/BaseUserPhoto.vue';
import { ViewTypes, type View } from './types';

const props = defineProps<{
  group: ListGroup;
  view: View;
  query?: QueryObserverResult<any, any>;
  columns: ColumnDef<any>[];
}>();
const emit = defineEmits(['click:row']);
const paginationOptions = defineModel<PaginationParams>('options', {
  required: true,
});
const rowHovered = defineModel<Row<Card>>('row:hovered');
const isExpanded = ref(props.group.isExpanded);

const itemsPerPage = ref(10);

const route = useRoute();
const listId = computed(() => +route.params.listId);
const usersService = useUsersService();
const cardsService = useCardsService();
const listsStagesService = useListStagesService();
const listGroupsService = useListGroupsService();
const queryClient = useQueryClient();
const getGroupCardsQuery = useInfiniteQuery({
  queryFn: getGroupCards,
  queryKey: [
    'cards',
    {
      groupId: props.group.id,
    },
  ],
  getNextPageParam: (lastPage, allPages, lastPageParam) => {
    if (lastPage?.cards.length === 0) {
      return undefined;
    }

    return lastPageParam + 1;
  },
  initialPageParam: 1,
  initialData: () => {
    return {
      pages: [props.group.cards],
      pageParams: [1],
    };
  },
  staleTime: 5 * 1000,
});
const { mutate: updateCardListStage } = useMutation({
  mutationFn: ({
    cardListId,
    listStageId,
  }: {
    cardListId: number;
    listStageId: number;
  }) =>
    cardsService.updateCardListStage({
      cardListId,
      listStageId,
    }),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['groups', listId.value] }),
});
const createCardMutation = useMutation({
  mutationFn: (createCardDto: CreateCardDto) =>
    cardsService.createCard(createCardDto),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['groups', listId.value] }),
});
const updateCardMutation = useMutation({
  mutationFn: (updateCardDto: Card) => cardsService.updateCard(updateCardDto),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['groups', listId.value] }),
});
const usersQuery = useQuery({
  queryKey: ['users'],
  queryFn: usersService.getUsers,
  refetchOnWindowFocus: false,
});
const listStagesQuery = useQuery({
  queryKey: ['listStages', listId.value],
  queryFn: () => listsStagesService.getListStages({ listId: listId.value }),
  refetchOnWindowFocus: false,
});
const updateListGroupMutation = useMutation({
  mutationFn: (listGroup: Partial<ListGroup>) =>
    listGroupsService.update(listGroup),
});

const groupCards = computed(() => {
  let cards: Card[] = [];
  getGroupCardsQuery.data.value?.pages.forEach((pageData) => {
    if (pageData) {
      cards = cards.concat(pageData.cards);
    }
  });

  return cards;
});

async function getGroupCards({ pageParam = 1 }) {
  const group = props.group;

  const cards = await cardsService.getCards({
    limit: itemsPerPage.value,
    page: pageParam,
    listId: listId.value,
    filters: group.filter,
  });

  return cards;
}

function handleRowClick(row: Row<Card>) {
  emit('click:row', row);
}

function handleUserSelection(users: User[]) {
  //TODO update card assignees
  console.log(users);
}

function handleCardCreation(createCardDto: Partial<CreateCardDto>) {
  createCardDto.listId = listId.value;
  //TODO Card creation won't work if group by is not stages
  createCardDto.listStageId = props.group.entityId;
  createCardMutation.mutate(createCardDto as CreateCardDto);
}

function handleChangeDueDate({
  card,
  newDueDate,
}: {
  card: Card;
  newDueDate: Date;
}) {
  const updatedCard = {
    ...card,
    dueAt: newDueDate.toISOString(),
  };
  updateCardMutation.mutate(updatedCard);
}

function toggleGroupExpansion() {
  isExpanded.value = !isExpanded.value;

  updateListGroupMutation.mutate({
    id: props.group.id,
    listId: listId.value,
    isExpanded: isExpanded.value,
  });
}

async function handleInfiniteScroll({ done }: any) {
  getGroupCardsQuery.fetchNextPage();
  if (getGroupCardsQuery.hasNextPage.value) {
    done('ok');
  } else {
    done('empty');
  }
}
</script>

<template>
  <div v-if="group" class="group">
    <v-banner sticky lines="one" border="none" bg-color="transparent">
      <v-btn
        variant="text"
        density="comfortable"
        size="small"
        :icon="isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        :color="isExpanded ? 'primary' : 'default'"
        class="me-2"
        @click="toggleGroupExpansion"
      />
      <div>
        <template v-if="group.type === ListGroupOptions.ASSIGNEES">
          <base-user-photo :photo="group.icon" size="20" />
        </template>
        <template v-else>
          <v-icon :color="group.color" size="20">{{
            group.icon ?? 'mdi-circle-slice-8'
          }}</v-icon>
        </template>
        <v-chip
          rounded="md"
          density="comfortable"
          :color="group.color"
          class="ms-3"
        >
          {{ group.name }}
          <template #append>
            <span class="text-caption ms-4 font-weight-bold">{{
              group.cards?.total ?? 0
            }}</span>
          </template>
        </v-chip>
      </div>
      <v-btn
        variant="text"
        density="comfortable"
        size="small"
        icon="mdi-plus"
        color="accent"
        class="ms-2"
      />
    </v-banner>
    <div class="content" v-if="isExpanded">
      <template v-if="view.type === ViewTypes.TABLE">
        <table-view
          v-model:row-hovered="rowHovered"
          v-model:options="paginationOptions"
          :columns="columns"
          :data="groupCards ?? []"
          :total="group.cards?.total ?? 0"
          :loading="getGroupCardsQuery.isFetching.value"
          @click:row="handleRowClick"
          @submit="handleCardCreation"
          @load="handleInfiniteScroll"
        >
          <template #listStage="{ row }">
            <list-stage-selector
              v-model="row.original.cardLists[0].listStage"
              :list-stages="listStagesQuery.data.value ?? []"
              @update:modelValue="
                (modelValue) =>
                  updateCardListStage({
                    cardListId: row.original.cardLists[0].id,
                    listStageId: modelValue.id,
                  })
              "
            />
          </template>
          <template #users="{ row }">
            <base-user-selector
              :model-value="row.original.users"
              :users="usersQuery.data.value?.users ?? []"
              @update:modelValue="handleUserSelection"
            />
          </template>
          <template #dueAt="{ row }">
            <base-date-picker
              :model-value="
                row.original.dueAt ? new Date(row.original.dueAt) : undefined
              "
              no-date-message="No Due Date"
              :close-on-content-click="true"
              @update:model-value="
              (newValue) =>
                handleChangeDueDate({
                  card: row.original,
                  newDueDate: newValue as Date,
                })
            "
            />
          </template>
          <template #actions="{ row }">
            <div class="text-right">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    v-if="rowHovered?.original.id === row.original.id"
                    v-bind="props"
                    density="compact"
                    size="small"
                    icon="mdi-dots-vertical"
                    variant="text"
                    color="default"
                  />
                </template>
                <v-card>
                  <v-card-title>Hello</v-card-title>
                </v-card>
              </v-menu>
            </div>
          </template>
        </table-view>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group {
  overflow: hidden;

  .content {
    max-width: 100%;
    overflow: scroll;
  }
}
</style>
