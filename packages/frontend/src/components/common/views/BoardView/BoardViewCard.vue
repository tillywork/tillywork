<script setup lang="ts">
import { useCard } from '@/composables/useCard';
import { useCardContextMenu } from '@/composables/useCardContextMenu';
import { useFields } from '@/composables/useFields';

import type { Card, Field, List } from '@tillywork/shared';

import ContextMenu from '../../base/ContextMenu/ContextMenu.vue';
import ListStageSelector from '../../inputs/ListStageSelector.vue';
import BaseField from '../../fields/BaseField.vue';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';

const {
  card,
  list,
  isDragging = false,
} = defineProps<{
  card: Card;
  list: List;
  isDragging?: boolean;
}>();

const {
  titleField,
  pinnedFieldsWithoutAssignee,
  assigneeField,
  getDateFieldColor,
} = useFields({
  cardTypeId: computed(() => card.type.id),
  listId: computed(() => list.id),
});

const { handleHoverCard, updateCardStage, updateFieldValue, getCardTitle } =
  useCard();
const { items, onUpdateMenuOpen } = useCardContextMenu(card);

const cardTitle = computed(() => getCardTitle(card, titleField));
</script>

<template>
  <context-menu :items @update:open="onUpdateMenuOpen">
    <v-hover
      #="{ props }"
      :disabled="isDragging"
      @update:model-value="(v) => handleHoverCard({ isHovering: v, card })"
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
              :list-stages="list.listStages"
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
          </template>

          <template v-if="cardTitle">
            <v-card-title
              class="text-wrap text-body-3"
              style="line-height: 1.5"
            >
              {{ cardTitle }}
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
        <v-card-actions class="pa-2 align-end" style="min-height: fit-content">
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
