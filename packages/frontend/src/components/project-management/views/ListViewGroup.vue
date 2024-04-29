<script setup lang="ts">
import { type ListGroup } from '../lists/types';
import {
  useQueryClient,
  type QueryObserverResult,
  useMutation,
  useQuery,
} from '@tanstack/vue-query';
import TableView from '@/components/project-management/views/TableView/TableView.vue';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import UserSelector from '@/components/common/inputs/UserSelector.vue';
import { type ColumnDef, type Row } from '@tanstack/vue-table';
import type { Card, CreateCardDto } from '../cards/types';
import type { User } from '@/components/common/users/types';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCardsService } from '@/composables/services/useCardsService';
import { ref } from 'vue';
import { useUsersService } from '@/composables/services/useUsersService';

const props = defineProps<{
  group: ListGroup;
  query?: QueryObserverResult<any, any>;
  columns: ColumnDef<any>[];
}>();
const emit = defineEmits(['click:row']);
const rowHovered = defineModel<Row<Card>>('row:hovered');
const isExpanded = ref(true);

const route = useRoute();
const listId = computed(() => +route.params.listId);
const usersService = useUsersService();
const cardsService = useCardsService();
const queryClient = useQueryClient();
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
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards'] }),
});
const createCardMutation = useMutation({
  mutationFn: (createCardDto: CreateCardDto) =>
    cardsService.createCard(createCardDto),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards'] }),
});
const usersQuery = useQuery({
  queryKey: ['users'],
  queryFn: usersService.getUsers,
});

function handleRowClick(row: Row<Card>) {
  emit('click:row', row);
}

function handleUserSelection(users: User[]) {
  //TODO update card assignees
  console.log(users);
}

function handleCardCreation(createCardDto: Partial<CreateCardDto>) {
  console.log(createCardDto);
  createCardDto.listId = listId.value;
  //TODO Card creation won't work if group by is not stages
  createCardDto.listStageId = props.group.entityId;
  createCardMutation.mutate(createCardDto as CreateCardDto);
}

function toggleGroupExpansion() {
  isExpanded.value = !isExpanded.value;
  //TODO save isExpanded value
}
</script>

<template>
  <div v-if="group">
    <div class="header d-flex align-center px-8 py-2">
      <v-btn
        variant="text"
        density="comfortable"
        :icon="isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        :color="isExpanded ? 'primary' : 'default'"
        class="me-3"
        @click="toggleGroupExpansion"
      />
      <v-icon size="12" :color="group.color">mdi-circle</v-icon>
      <span class="text-body-2 font-weight-bold mx-2">{{ group.name }}</span>
      <span class="text-caption">{{ group.cards?.total ?? 0 }}</span>
    </div>
    <div class="content" v-if="isExpanded">
      <table-view
        :key="'list-view-' + group.id"
        v-model:row-hovered="rowHovered"
        :options="group.options"
        :columns="columns"
        :column-pinning="{ left: ['actions'] }"
        :data="group.cards?.cards ?? []"
        :total="group.cards?.total ?? 0"
        @click:row="handleRowClick"
        @submit="handleCardCreation"
      >
        <template #listStage="{ row }">
          <list-stage-selector
            v-model="row.original.cardLists[0].listStage"
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
          <user-selector
            :model-value="row.original.users"
            :users="usersQuery.data.value?.users ?? []"
            @update:modelValue="handleUserSelection"
          />
        </template>
        <template #actions="{ row }">
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
        </template>
      </table-view>
    </div>
  </div>
</template>
