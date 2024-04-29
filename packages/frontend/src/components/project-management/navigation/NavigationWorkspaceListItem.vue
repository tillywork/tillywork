<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { type List } from '../lists/types';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import NavigationWorkspaceListItemMenu from './NavigationWorkspaceListItemMenu.vue';

const route = useRoute();
const router = useRouter();

const props = defineProps<{
  list: List;
}>();
const freezeListHoverId = ref<number | null>();

const workspaceStore = useWorkspaceStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);

function handleListClick(list: List) {
  router.push({
    name: 'ListPage',
    params: {
      workspaceId: selectedWorkspace?.value?.id,
      spaceId: list.spaceId,
      listId: list.id,
    },
  });
}

function setHoverFreeze(list: List) {
  freezeListHoverId.value = list.id;
}

function clearHoverFreeze() {
  freezeListHoverId.value = null;
}
</script>

<template>
  <v-hover v-slot="{ isHovering: isListHovering, props: listHoverProps }">
    <v-list-item
      rounded="md"
      prepend-icon="mdi-list-box-outline"
      slim
      v-bind="listHoverProps"
      @click="handleListClick(list)"
      :active="+route.params.listId === list.id"
    >
      <v-list-item-title class="user-select-none">{{
        list.name
      }}</v-list-item-title>
      <template
        v-slot:append
        v-if="isListHovering || freezeListHoverId === list.id"
      >
        <navigation-workspace-list-item-menu
          @hover:freeze="setHoverFreeze(list)"
          @hover:unfreeze="clearHoverFreeze"
        />
      </template>
    </v-list-item>
  </v-hover>
</template>
