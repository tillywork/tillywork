<script setup lang="ts">
import { useViewsService } from '@/services/useViewsService';
import BaseViewChip from './BaseViewChip.vue';
import type { View } from './types';
import { useStateStore } from '@/stores/state';

const props = defineProps<{
  view: View;
}>();

const { currentList } = storeToRefs(useStateStore());

const { useUpdateViewMutation } = useViewsService();
const { mutateAsync: updateView } = useUpdateViewMutation();

function handleToggleCompleted() {
  updateView({
    id: props.view.id,
    ignoreCompleted: !props.view.ignoreCompleted,
  });
}

function handleToggleChildren() {
  updateView({
    id: props.view.id,
    ignoreChildren: !props.view.ignoreChildren,
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
                :model-value="!view.ignoreCompleted"
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
                :model-value="!view.ignoreChildren"
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
