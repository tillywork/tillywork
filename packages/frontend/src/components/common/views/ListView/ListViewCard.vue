<script setup lang="ts">
import { useCard } from '@/composables/useCard';
import { useCardContextMenu } from '@/composables/useCardContextMenu';
import { useFields } from '@/composables/useFields';

import { useQueryStore } from '@/stores/query';

import type { Card, Field } from '@tillywork/shared';

import ContextMenu from '../../base/ContextMenu/ContextMenu.vue';
import ListStageSelector from '../../inputs/ListStageSelector.vue';
import BaseIconBtn from '../../base/BaseIconBtn.vue';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';
import BaseField from '../../fields/BaseField.vue';

const { card, isDragging } = defineProps<{
  card: Card;
  isDragging?: boolean;
}>();

const { list, listStages } = storeToRefs(useQueryStore());

const {
  titleField,
  pinnedFieldsWithoutAssignee,
  assigneeField,
  getDateFieldColor,
} = useFields({
  cardTypeId: computed(() => card.type.id),
  listId: computed(() => Number(list.value?.id)),
});

const { handleHoverCard, updateCardStage, updateFieldValue } = useCard();
const { items, onUpdateMenuOpen } = useCardContextMenu(card);
</script>

<template>
  <context-menu :items #="{ showMenu }" @update:open="onUpdateMenuOpen">
    <v-hover
      #="{ isHovering: isRowHovering, props: rowProps }"
      :disabled="isDragging"
      @update:model-value="
        (v) => handleHoverCard({ isHovering: v, card: card })
      "
    >
      <v-list-item
        class="list-row text-body-3 border-b-thin"
        rounded="0"
        height="36"
        :to="`/card/${card.id}`"
        :ripple="false"
        v-bind="rowProps"
      >
        <template #prepend>
          <div :style="{ width: '30px' }" class="d-flex justify-end me-2">
            <template v-if="isRowHovering">
              <base-icon-btn
                icon="mdi-dots-vertical"
                @click.prevent="showMenu"
              />
            </template>
          </div>
        </template>
        <v-list-item-title class="d-flex align-center ga-1">
          <list-stage-selector
            :model-value="card.cardLists[0].listStage"
            theme="icon"
            rounded="circle"
            :listStages
            @update:modelValue="
              (newStage) => {
                if (newStage) {
                  updateCardStage({
                    cardId: card.id,
                    cardListId: card.cardLists[0].id,
                    listStageId: newStage.id,
                  });
                }
              }
            "
            @click.prevent
          />

          <template v-if="titleField">
            <span class="text-truncate ms-2">
              {{ card.data[titleField.slug] }}
            </span>
          </template>
          <template v-else>
            <v-skeleton-loader type="text" width="100%" />
          </template>

          <!-- Progress -->
          <base-card-children-progress
            v-if="card.children.length > 0"
            :card="card"
            border="thin"
            class="text-caption ms-2"
            style="padding-top: 2px !important; padding-bottom: 2px !important"
          />
        </v-list-item-title>
        <template #append>
          <div
            class="d-flex align-center ga-2 me-6"
            :style="{
              maxHeight: '28px',
            }"
          >
            <template
              v-for="field in pinnedFieldsWithoutAssignee"
              :key="field.slug"
            >
              <base-field
                :field
                :color="getDateFieldColor(card, field)"
                :model-value="card.data[field.slug]"
                @update:model-value="(v: string) => updateFieldValue({
                    card: card,
                    field,
                    v
                })"
              />
            </template>
            <template v-if="assigneeField">
              <base-field
                :field="assigneeField"
                :model-value="card.data[assigneeField.slug]"
                @update:model-value="(v: string) => updateFieldValue({
                    card: card,
                    field: assigneeField as Field,
                    v
                })"
                hide-label
              />
            </template>
          </div>
        </template>
      </v-list-item>
    </v-hover>
  </context-menu>
</template>
