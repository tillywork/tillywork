<script setup lang="ts">
import { useViewsService } from '@/services/useViewsService';
import BaseViewChip from './BaseViewChip.vue';
import type { View } from './types';
import { useStateStore } from '@/stores/state';

const view = defineModel<View>({
  required: true,
});

const { currentList } = storeToRefs(useStateStore());

const { useUpdateViewMutation } = useViewsService();
const { mutateAsync: updateView } = useUpdateViewMutation();

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
        </v-list>
      </v-card>
    </v-menu>
  </base-view-chip>
</template>
