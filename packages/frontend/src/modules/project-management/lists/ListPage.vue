<script setup lang="ts">
import { ref } from 'vue';
import { useListsService } from '@/composables/services/useListsService';
import { useRoute } from 'vue-router';
import { ListGroupOptions, type ListGroup } from './types';
import { watch } from 'vue';
import { useCardsService } from '@/composables/services/useCardsService';
import type { Card, CreateCardDto } from '../cards/types';
import { computed } from 'vue';
import ListView from '@/modules/project-management/views/ListView/ListView.vue';
import ListStageSelector from '@/modules/common/inputs/ListStageSelector.vue';
import UserSelector from '@/modules/common/inputs/UserSelector.vue';
import { type ColumnDef, type Row } from '@tanstack/vue-table';
import type { User } from '@/modules/common/users/types';
import {
  useQuery,
  useQueries,
  useQueryClient,
  useMutation,
} from '@tanstack/vue-query';

const listId = computed(() => +route.params.listId);
const listsService = useListsService();
const cardsService = useCardsService();
const route = useRoute();

const columns: ColumnDef<Card, any>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Title',
  },
  {
    id: 'listStage',
    header: 'Stage',
  },
  {
    id: 'users',
    header: 'Assignees',
  },
  {
    id: 'actions',
    enableResizing: false,
    enableSorting: false,
    size: 25,
  },
];

const rowHovered = ref<Row<Card>>();
const { data: list, refetch: refetchList } = useQuery({
  queryKey: ['list', listId.value],
  queryFn: () => listsService.getList(listId.value),
});
const groupBy = ref<ListGroupOptions>(ListGroupOptions.LIST_STAGE);
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

watch(list, () => {
  document.title = `${list.value?.name} | FalconDrive`;
});

watch(listId, () => refetchList());

const groups = computed(() => {
  const groups: ListGroup[] = [];
  switch (groupBy.value) {
    case ListGroupOptions.LIST_STAGE:
      if (list.value && list.value.listStages.length > 0) {
        list.value?.listStages.forEach((listStage) => {
          groups.push({
            id: listStage.id,
            name: listStage.name,
            color: listStage.color,
            filters: {
              where: {
                and: [
                  {
                    field: 'cardLists.listStageId',
                    operator: 'eq',
                    value: listStage.id,
                  },
                ],
              },
            },
            options: {
              page: 1,
              itemsPerPage: 10,
              sort: [
                {
                  key: 'createdAt',
                  order: 'desc',
                },
              ],
            },
          });
        });
      }
      break;
    default:
      groups.push({
        id: list.value?.listStages[0].id ?? 0,
        name: 'Cards',
        filters: {},
      });
  }

  return groups;
});

const queries = computed(() =>
  groups.value.map((group) => {
    return {
      queryKey: ['cards', group.name, list.value?.id],
      queryFn: () =>
        cardsService.getCards({
          listId: listId.value,
          page: group.options?.page ?? 1,
          limit: group.options?.itemsPerPage ?? 10,
          sortBy: group.options?.sort,
          filters: group.filters,
        }),
    };
  })
);
const groupCardQueries = useQueries({ queries });

function handleUserSelection(users: User[]) {
  console.log(users);
}

function handleCardCreation(createCardDto: Partial<CreateCardDto>) {
  createCardDto.listId = listId.value;
  createCardMutation.mutate(createCardDto as CreateCardDto);
}
</script>

<template>
  <v-container>
    <span>{{ list?.name }}</span>
  </v-container>
  <v-divider />
  <v-expansion-panels multiple variant="accordion">
    <template v-for="(group, index) in groups" :key="group.name">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon size="12" :color="group.color">mdi-circle</v-icon>
          <span class="text-body-2 font-weight-bold mx-2">{{
            group.name
          }}</span>
          <span class="text-caption"
            >{{ groupCardQueries[index].data?.total ?? 0 }} cards</span
          >
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <list-view
            :key="'list-view-' + group.id"
            v-model:row-hovered="rowHovered"
            :options="group.options"
            :columns="columns"
            :column-pinning="{ left: ['actions'] }"
            :data="groupCardQueries[index].data?.cards ?? []"
            :total="groupCardQueries[index].data?.total ?? 0"
            @click:row="(row) => console.log(row)"
            @submit="
              (data) => handleCardCreation({ ...data, listStageId: group.id })
            "
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
                @update:modelValue="
                  (modelValue) => handleUserSelection(modelValue)
                "
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
          </list-view>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </template>
  </v-expansion-panels>
</template>

<style lang="scss">
.v-expansion-panel {
  background-color: rgb(var(--v-theme-background));

  .v-expansion-panel-text__wrapper {
    padding: 0;
  }
}
</style>
