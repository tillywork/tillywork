<script setup lang="ts">
import draggable from 'vuedraggable';
import {
  ListGroupOptions,
  type QueryFilter,
  type ViewFilter,
  FieldTypes,
  type View,
  type Card,
  type ListGroup,
  type ListStage,
  type List,
  type SortState,
  type Field,
  type ProjectUser,
} from '@tillywork/shared';

import objectUtils from '@/utils/object';
import { cloneDeep } from 'lodash';

import { useCardsService } from '@/services/useCardsService';

import { useListGroup } from '@/composables/useListGroup';
import { useCard } from '@/composables/useCard';
import { useFields } from '@/composables/useFields';

import { useFieldQueryStore } from '@/stores/field.query';

import BaseField from '@/components/common/fields/BaseField.vue';
import ContextMenu from '@/components/common/base/ContextMenu/ContextMenu.vue';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';

const props = defineProps<{
  listGroup: ListGroup;
  listStages: ListStage[];
  view: View;
  list: List;
  projectUsers: ProjectUser[];
}>();

const isGroupCardsLoading = defineModel<boolean>('loading');

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
  handleUpdateCardStage,
  handleHoverCard,
} = useListGroup({ props, cards });

const { updateFieldValue, getCardContextMenuItems } = useCard();
const { getDateFieldColor } = useFields({});

const { titleField, assigneeField, pinnedFieldsWithoutAssignee } = storeToRefs(
  useFieldQueryStore()
);

const groupCopy = ref(cloneDeep(props.listGroup));
const sortBy = computed<SortState>(() =>
  props.view.options.sortBy ? [cloneDeep(props.view.options.sortBy)] : []
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

const hideCompleted = computed<boolean>(
  () => props.view.options.hideCompleted ?? false
);
const hideChildren = computed<boolean>(
  () => props.view.options.hideChildren ?? false
);

const total = ref(0);

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
          <context-menu :items="getCardContextMenuItems(card)">
            <v-hover
              #="{ props }"
              :disabled="isDragging"
              @update:model-value="
                (v) => handleHoverCard({ isHovering: v, card })
              "
            >
              <v-card
                :to="`/card/${card.id}`"
                :ripple="false"
                v-bind="props"
                color="card"
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
                      <base-field
                        :field="assigneeField"
                        :color="getDateFieldColor(card, assigneeField)"
                        :model-value="card.data[assigneeField.slug]"
                        @update:model-value="(v: string) => updateFieldValue({
                          card,
                          field: assigneeField as Field,
                          v
                        })"
                        hide-label
                      />
                    </template>
                  </template>
                </v-card-item>
                <v-card-actions
                  class="pa-2 align-end"
                  style="min-height: fit-content"
                >
                  <div class="d-flex align-center flex-wrap flex-fill ga-2">
                    <template v-if="pinnedFieldsWithoutAssignee">
                      <template
                        v-for="field in pinnedFieldsWithoutAssignee"
                        :key="field.slug"
                      >
                        <base-field
                          :field
                          :color="getDateFieldColor(card, field)"
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
                    class="text-caption mb-1 flex-0-0"
                  />
                </v-card-actions>
              </v-card>
            </v-hover>
          </context-menu>
        </template>
      </draggable>
    </v-infinite-scroll>
  </v-card>
</template>
