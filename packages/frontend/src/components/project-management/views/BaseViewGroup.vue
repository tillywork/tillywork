<script setup lang="ts">
import { type ListGroup, type ListStage } from '../lists/types';
import TableView from '@/components/project-management/views/TableView/TableView.vue';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import BaseUserSelector from '@/components/common/inputs/BaseUserSelector.vue';
import { type ColumnDef, type Row } from '@tanstack/vue-table';
import type { Card, CreateCardDto } from '../cards/types';
import type { User } from '@/components/common/users/types';
import { useCardsService } from '@/composables/services/useCardsService';
import { useUsersService } from '@/composables/services/useUsersService';
import { useListStagesService } from '@/composables/services/useListStagesService';
import BaseDatePicker from '@/components/common/inputs/BaseDatePicker.vue';
import { useListGroupsService } from '@/composables/services/useListGroupsService';
import { ListGroupOptions } from '../lists/types';
import BaseAvatar from '@/components/common/base/BaseAvatar.vue';
import { ViewTypes, type View } from './types';
import { useDialog } from '@/composables/useDialog';
import { DIALOGS } from '@/components/common/dialogs/types';
import type { TableSortOption } from './TableView/types';

const props = defineProps<{
  group: ListGroup;
  view: View;
  columns: ColumnDef<any>[];
}>();
const emit = defineEmits(['click:row']);
const rowHovered = defineModel<Row<Card>>('row:hovered');
const isExpanded = ref(props.group.isExpanded);

const dialog = useDialog();
const route = useRoute();
const listId = computed(() => +route.params.listId);
const usersService = useUsersService();
const cardsService = useCardsService();
const listsStagesService = useListStagesService();
const listGroupsService = useListGroupsService();
const sortBy = ref<TableSortOption | undefined>(props.view.sortBy);

const getGroupCardsQuery = cardsService.useGetGroupCardsInfinite({
  listId: listId.value,
  groupId: props.group.id,
  filters: props.group.filter,
  initialCards: props.group.cards,
  sortBy,
});

watch(
  () => props.view,
  (v) => {
    sortBy.value = v.sortBy;
    getGroupCardsQuery.refetch();
  },
  { deep: true }
);

const { mutate: updateCardListStage } =
  cardsService.useUpdateCardListStageMutation();
const createCardMutation = cardsService.useCreateCardMutation();
const updateCardMutation = cardsService.useUpdateCardMutation();
const usersQuery = usersService.useUsersQuery();

const listStagesQuery = listsStagesService.useGetListStagesQuery(listId.value);
const updateListGroupMutation = listGroupsService.useUpdateListGroupMutation();

const groupCards = computed(() => {
  let cards: Card[] = [];
  const queryPages = getGroupCardsQuery.data.value?.pages ?? [];
  queryPages.forEach((pageData) => {
    if (pageData) {
      cards = [...cards, ...pageData.cards];
    }
  });

  return cards;
});

function handleRowClick(row: Row<Card>) {
  emit('click:row', row);
}

function handleUserSelection(users: User[], card: Card) {
  const updatedCard: Card = {
    ...card,
    users,
  };
  updateCardMutation.mutate(updatedCard);
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
  if (!getGroupCardsQuery.isFetching.value) {
    getGroupCardsQuery.fetchNextPage();
    if (getGroupCardsQuery.hasNextPage.value) {
      done('ok');
    } else {
      done('empty');
    }
  } else {
    done();
  }
}

function openCreateCardDialog(group: ListGroup) {
  dialog.openDialog(DIALOGS.CREATE_CARD, {
    listId: listId.value,
    listStage: getCurrentStage(group),
    users: getCurrentAssignee(group),
  });
}

function getCurrentStage(group: ListGroup) {
  let stage: ListStage | undefined;

  if (group.type === ListGroupOptions.LIST_STAGE) {
    stage = listStagesQuery.data.value?.find((stage) => {
      return stage.id == group.entityId;
    });
  }

  return stage ? { ...stage } : undefined;
}

function getCurrentAssignee(group: ListGroup) {
  let user: User | undefined;

  if (group.type === ListGroupOptions.ASSIGNEES) {
    user = usersQuery.data.value?.users.find((user) => {
      return user.id == group.entityId;
    });
  }

  return user ? [{ ...user }] : undefined;
}
</script>

<template>
  <div v-if="group" class="group">
    <v-banner sticky lines="one" border="none" bg-color="accent">
      <v-btn
        variant="text"
        density="comfortable"
        size="small"
        :icon="isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        :color="isExpanded ? 'info' : 'default'"
        class="me-2"
        @click="toggleGroupExpansion"
      />
      <div>
        <template v-if="group.type === ListGroupOptions.ASSIGNEES">
          <base-avatar
            :photo="group.icon"
            :text="group.name"
            size="x-small"
            class="text-caption"
          />
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
        color="info"
        class="ms-2"
        @click="openCreateCardDialog(group)"
      />
    </v-banner>
    <div class="content" v-if="group && group.cards && isExpanded">
      <template v-if="view.type === ViewTypes.TABLE">
        <table-view
          :columns="columns"
          :data="groupCards"
          :total="group.cards?.total ?? 0"
          @click:row="handleRowClick"
          @submit="handleCardCreation"
          @load="handleInfiniteScroll"
          no-headers
        >
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
                <v-card color="accent">
                  <v-card-title>Hello</v-card-title>
                </v-card>
              </v-menu>
            </div>
          </template>
          <template #title="{ row }">
            <list-stage-selector
              v-model="row.original.cardLists[0].listStage"
              theme="icon"
              rounded="circle"
              :list-stages="listStagesQuery.data.value ?? []"
              @update:modelValue="
                (modelValue) =>
                  updateCardListStage({
                    cardListId: row.original.cardLists[0].id,
                    listStageId: modelValue.id,
                  })
              "
            />
            <span class="ms-2">{{ row.original.title }}</span>
          </template>
          <template #info="{ row }">
            <div class="d-flex align-center justify-end flex-wrap pe-6">
              <base-date-picker
                :model-value="
                  row.original.dueAt ? new Date(row.original.dueAt) : undefined
                "
                @update:model-value="(newValue) =>
                  handleChangeDueDate({
                    card: row.original,
                    newDueDate: newValue as Date,
                  })
                "
                class="text-caption"
                no-date-message="Set due date"
              />
              <base-user-selector
                :model-value="row.original.users"
                :users="usersQuery.data.value?.users ?? []"
                activator-hover-text="Assign users"
                @update:model-value="
                  (users) => handleUserSelection(users, row.original)
                "
              />
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
