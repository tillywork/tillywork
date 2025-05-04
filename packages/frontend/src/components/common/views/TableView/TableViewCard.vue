<script setup lang="ts">
import { useCard } from '@/composables/useCard';
import { useCardContextMenu } from '@/composables/useCardContextMenu';
import { useFields } from '@/composables/useFields';

import { useQueryStore } from '@/stores/query';

import type { Row } from '@tanstack/vue-table';
import { CardTypeLayout, FieldTypes, type Card } from '@tillywork/shared';

import ContextMenu from '../../base/ContextMenu/ContextMenu.vue';
import ListStageSelector from '../../inputs/ListStageSelector.vue';
import BaseCardChildrenProgress from '../../cards/BaseCardChildrenProgress.vue';
import BaseField from '../../fields/BaseField.vue';
import { FlexRender } from '@tanstack/vue-table';

const {
  row,
  columnSizes,
  isDragging = false,
} = defineProps<{
  row: Row<Card>;
  isDragging?: boolean;
  columnSizes: {
    id: string;
    size: number;
  }[];
}>();

const { list, listStages } = storeToRefs(useQueryStore());

const { titleField, getDateFieldColor } = useFields({
  cardTypeId: computed(() => row.original.type.id),
  listId: computed(() => Number(list.value?.id)),
});

const { handleHoverCard, updateCardStage, updateFieldValue } = useCard();
const { items, onUpdateMenuOpen } = useCardContextMenu(row.original);

function getColumnSize(columnId: string) {
  const columnSize = columnSizes.find((cs) => cs.id === columnId);
  return columnSize?.size;
}

/**
 * @param {FieldTypes} fieldType
 * @returns boolean Whether or not this field should be rendered as a base field, or just the value
 */
function shouldRenderField(fieldType: FieldTypes) {
  return ![FieldTypes.TEXT, FieldTypes.EMAIL, FieldTypes.URL].includes(
    fieldType
  );
}
</script>

<template>
  <context-menu :items #="{ showMenu }" @update:open="onUpdateMenuOpen">
    <v-list-item
      class="pa-0"
      rounded="0"
      min-height="33"
      :to="`/card/${row.original.id}`"
      :ripple="false"
    >
      <v-hover
        #="{ isHovering: isRowHovering, props: rowProps }"
        :disabled="isDragging"
        @update:model-value="
          (v) => handleHoverCard({ isHovering: v, card: row.original })
        "
      >
        <v-card
          color="transparent"
          v-bind="rowProps"
          min-height="33"
          class="table-row d-flex text-body-3 flex-fill align-items-stretch"
          rounded="0"
          link
          :ripple="false"
        >
          <template v-for="cell in row.getVisibleCells()" :key="cell.id">
            <template v-if="cell.column.columnDef.cellType === 'actions'">
              <v-card
                :width="getColumnSize(cell.column.columnDef.id)"
                class="table-cell d-flex align-center pe-1"
                rounded="0"
                color="transparent"
              >
                <div
                  class="d-flex flex-fill justify-end ga-1"
                  v-if="isRowHovering"
                >
                  <base-icon-btn
                    icon="mdi-dots-vertical"
                    @click.prevent="showMenu"
                  />
                </div>
              </v-card>
            </template>
            <template v-else-if="cell.column.columnDef.cellType === 'title'">
              <v-card
                :width="getColumnSize(cell.column.columnDef.id)"
                class="d-flex align-center text-body-3 px-2 table-cell"
                rounded="0"
                color="transparent"
              >
                <list-stage-selector
                  v-if="listStages?.length"
                  :model-value="row.original.cardLists[0].listStage"
                  theme="icon"
                  rounded="circle"
                  :listStages
                  @update:modelValue="
                    (newStage) => {
                      if (newStage) {
                        updateCardStage({
                          cardId: row.original.id,
                          cardListId: row.original.cardLists[0].id,
                          listStageId: newStage.id,
                        });
                      }
                    }
                  "
                  @click.prevent
                />

                <template v-if="titleField">
                  <span
                    class="ms-2"
                    :class="{
                      'text-truncate': !isRowHovering,
                    }"
                  >
                    {{ row.original.data[titleField.slug] }}
                  </span>
                </template>
                <template v-else>
                  <template
                    v-if="
                      list?.defaultCardType.layout === CardTypeLayout.PERSON
                    "
                  >
                    <span
                      class="ms-2"
                      :class="{
                        'text-truncate': !isRowHovering,
                      }"
                    >
                      {{ row.original.data.first_name }}
                      {{ row.original.data.last_name }}
                    </span>
                  </template>
                  <v-skeleton-loader v-else type="text" width="100%" />
                </template>

                <!-- Progress -->
                <base-card-children-progress
                  v-if="row.original.children.length > 0"
                  :card="row.original"
                  border="thin"
                  min-width="fit-content"
                  class="text-caption ms-2"
                  style="
                    padding-top: 2px !important;
                    padding-bottom: 2px !important;
                  "
                />
              </v-card>
            </template>
            <template v-else>
              <v-card
                :width="getColumnSize(cell.column.columnDef.id)"
                class="table-cell d-flex align-center"
                rounded="0"
                color="transparent"
                link
              >
                <template
                  v-if="shouldRenderField(cell.column.columnDef.cellType)"
                >
                  <base-field
                    class="h-100"
                    :field="cell.column.columnDef.field"
                    :model-value="
                      row.original.data[cell.column.columnDef.field.slug]
                    "
                    :color="
                      getDateFieldColor(
                        row.original,
                        cell.column.columnDef.field
                      )
                    "
                    rounded="0"
                    flex-fill
                    @update:model-value="
                        (v: any) => updateFieldValue({ 
                            card: row.original,
                            field: cell.column.columnDef.field,
                            v
                        })
                    "
                    hide-icon
                    table
                    @click.stop
                  />
                </template>
                <template v-else>
                  <div class="pa-2">
                    <flex-render
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </div>
                </template>
              </v-card>
            </template>
          </template>
        </v-card>
      </v-hover>
    </v-list-item>
  </context-menu>
</template>
