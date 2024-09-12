<script setup lang="ts">
import { useViewsService } from '@/services/useViewsService';
import BaseViewChip from './BaseViewChip.vue';
import type { View } from './types';
import { useStateStore } from '@/stores/state';
import { useFields } from '@/composables/useFields';
import { ViewTypes, type Field } from '@tillywork/shared';
import { cloneDeep } from 'lodash';

const view = defineModel<View>({
  required: true,
});

const { currentList } = storeToRefs(useStateStore());

const { useUpdateViewMutation } = useViewsService();
const { mutateAsync: updateView } = useUpdateViewMutation();

const cardTypeId = computed(() => currentList.value?.defaultCardType.id ?? 0);

const { titleField, tableFields } = useFields({
  cardTypeId,
  listId: currentList.value!.id,
});

function handleToggleCompleted() {
  updateView({
    id: view.value.id,
    options: {
      ...view.value.options,
      hideCompleted: !view.value.options.hideCompleted,
    },
  });
}

function handleToggleChildren() {
  updateView({
    id: view.value.id,
    options: {
      ...view.value.options,
      hideChildren: !view.value.options.hideChildren,
    },
  });
}

function isColumnEnabledInView(field: Field) {
  return view.value.options.columns?.includes(field.id.toString());
}

function handleToggleColumn(field: Field) {
  let viewColumns = cloneDeep(view.value.options.columns) ?? [];
  const columnIndex = viewColumns?.findIndex(
    (fieldId) => fieldId === field.id.toString()
  );

  if (columnIndex === -1) {
    viewColumns?.push(field.id.toString());
  } else {
    viewColumns = [
      ...viewColumns.slice(0, columnIndex),
      ...viewColumns.slice(columnIndex + 1),
    ];
  }

  updateView({
    id: view.value.id,
    options: {
      ...view.value.options,
      columns: viewColumns,
    },
  });
}
//TODO drag columns to reorder
</script>

<template>
  <base-view-chip icon="mdi-eye" label="Display" is-filled>
    <v-menu activator="parent" :close-on-content-click="false">
      <v-card>
        <v-list>
          <v-list-item @click="handleToggleCompleted">
            <template #append>
              <v-switch
                :model-value="!view.options.hideCompleted"
                readonly
                inset
                hide-details
                density="compact"
                class="ms-2"
              />
            </template>
            <v-list-item-title> Show completed </v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleToggleChildren">
            <template #append>
              <v-switch
                :model-value="!view.options.hideChildren"
                readonly
                inset
                hide-details
                density="compact"
                class="ms-2"
              />
            </template>
            <v-list-item-title>
              Show sub {{ currentList?.defaultCardType.name.toLowerCase() }}s
            </v-list-item-title>
          </v-list-item>
          <v-menu
            :close-on-content-click="false"
            location="end"
            width="225"
            v-if="view.type === ViewTypes.TABLE"
          >
            <template #activator="{ props }">
              <v-list-item v-bind="props">
                <v-list-item-title>Fields</v-list-item-title>
                <template #append>
                  <v-icon icon="mdi-chevron-right" />
                </template>
              </v-list-item>
            </template>
            <v-card max-height="400">
              <v-list :lines="false">
                <v-list-item disabled v-if="titleField">
                  <template #prepend>
                    <v-icon :icon="titleField.icon" />
                  </template>
                  <v-list-item-title>{{ titleField.name }}</v-list-item-title>
                  <template #append>
                    <v-switch
                      :model-value="true"
                      readonly
                      inset
                      hide-details
                      density="compact"
                      class="ms-2"
                    />
                  </template>
                </v-list-item>
                <template v-for="field in tableFields" :key="field.id">
                  <v-list-item @click="handleToggleColumn(field)">
                    <template #prepend>
                      <v-icon :icon="field.icon" />
                    </template>
                    <v-list-item-title>{{ field.name }}</v-list-item-title>
                    <template #append>
                      <v-switch
                        :model-value="isColumnEnabledInView(field)"
                        inset
                        hide-details
                        density="compact"
                        class="ms-2"
                        @update:modelValue="handleToggleColumn(field)"
                      />
                    </template>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </v-menu>
        </v-list>
      </v-card>
    </v-menu>
  </base-view-chip>
</template>
