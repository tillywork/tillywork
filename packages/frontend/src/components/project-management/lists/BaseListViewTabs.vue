<script setup lang="ts">
import { useDialog } from '@/composables/useDialog';
import { ViewTypes, type View } from '../views/types';
import type { List } from './types';
import { DIALOGS } from '@/components/common/dialogs/types';

const dialog = useDialog();
const props = defineProps<{
  views: View[];
  list: List;
}>();

const selectedView = defineModel<View>();
const freezeHoverViewId = ref<number>();

function handleTabSelection(view: View) {
  selectedView.value = view;
}

function getViewIconByType(type: ViewTypes) {
  switch (type) {
    case ViewTypes.TABLE:
      return 'mdi-table';
    case ViewTypes.BOARD:
      return 'mdi-view-column';
    default:
      return 'mdi-view-carousel';
  }
}

function openCreateViewDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_VIEW,
    data: {
      list: props.list,
    },
  });
}
</script>

<template>
  <div class="d-flex justify-start align-center">
    <template v-for="view in views" :key="view.id">
      <v-hover #="{ isHovering, props }">
        <v-btn
          v-bind="props"
          rounded="0"
          variant="text"
          class="text-capitalize"
          color="default"
          @click="handleTabSelection(view)"
          size="small"
          :class="
            selectedView?.id === view.id ? 'border-b-md border-b-primary' : ''
          "
        >
          <template #prepend>
            <v-icon :icon="getViewIconByType(view.type)" />
          </template>
          {{ view.name }}
          <template #append v-if="isHovering || freezeHoverViewId === view.id">
            <v-menu
              @update:model-value="
                (v) => {
                  if (!v) freezeHoverViewId = undefined;
                  else freezeHoverViewId = view.id;
                }
              "
            >
              <template #activator="{ props }">
                <base-icon-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  density="compact"
                  class="ms-2"
                />
              </template>
              <v-card class="border-thin">
                <v-list>
                  <v-list-item class="text-error">
                    <template #prepend>
                      <v-icon icon="mdi-delete" />
                    </template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>
        </v-btn>
      </v-hover>
    </template>
    <v-btn
      class="text-capitalize"
      variant="text"
      size="small"
      rounded="0"
      @click="openCreateViewDialog"
    >
      <template #prepend>
        <v-icon icon="mdi-plus" />
      </template>
      View
    </v-btn>
  </div>
</template>
