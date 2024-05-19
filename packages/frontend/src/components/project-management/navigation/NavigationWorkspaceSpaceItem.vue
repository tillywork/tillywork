<script setup lang="ts">
import { type Space } from '../spaces/types';
import NavigationWorkspaceListItem from './NavigationWorkspaceListItem.vue';
import NavigationWorkspaceSpaceItemMenu from './NavigationWorkspaceSpaceItemMenu.vue';
import CreateListDialogAndButton from '../navigation/CreateListDialogAndButton.vue';

defineProps<{
  space: Space;
}>();

const freezeSpaceHoverId = ref<number | null>();

const createListDialog = ref(false);

function handleCreateListDialogClick(space: Space) {
  freezeSpaceHoverId.value = space.id;
}

function setHoverFreeze(space: Space) {
  freezeSpaceHoverId.value = space.id;
}

function clearHoverFreeze() {
  freezeSpaceHoverId.value = null;
}

watch(createListDialog, () => {
  if (!createListDialog.value) {
    freezeSpaceHoverId.value = null;
  }
});
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-list-group :value="space.id" v-bind="hoverProps" subgroup>
      <template v-slot:activator="{ props: groupProps }">
        <v-list-item rounded="md" v-bind="groupProps" slim>
          <template v-slot:prepend v-if="!isHovering">
            <v-icon>mdi-folder-outline</v-icon>
          </template>
          <v-list-item-title class="user-select-none">
            {{ space.name }}
          </v-list-item-title>
          <template
            v-slot:append
            v-if="isHovering || freezeSpaceHoverId === space.id"
          >
            <div class="d-flex ga-1">
              <create-list-dialog-and-button
                v-model="createListDialog"
                :space="space"
                @click="handleCreateListDialogClick(space)"
              />
              <navigation-workspace-space-item-menu
                :space
                @hover:freeze="setHoverFreeze(space)"
                @hover:unfreeze="clearHoverFreeze"
              />
            </div>
          </template>
        </v-list-item>
      </template>

      <template v-for="list in space.lists" :key="list.id">
        <navigation-workspace-list-item :list="list" />
      </template>
    </v-list-group>
  </v-hover>
</template>
