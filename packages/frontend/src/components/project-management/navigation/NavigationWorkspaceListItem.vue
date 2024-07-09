<script setup lang="ts">
import { type List } from '../lists/types';
import NavigationWorkspaceListItemMenu from './NavigationWorkspaceListItemMenu.vue';

const route = useRoute();
const router = useRouter();

defineProps<{
  list: List;
}>();

const freezeListHoverId = ref<number | null>();

function handleListClick(list: List) {
  router.push(`/pm/list/${list.id}`);
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
      :prepend-icon="list.icon ?? 'mdi-list-box-outline'"
      slim
      v-bind="listHoverProps"
      @click="handleListClick(list)"
      :active="+route.params.listId === list.id"
    >
      <v-list-item-title class="user-select-none">
        {{ list.name }}
      </v-list-item-title>
      <template
        v-slot:append
        v-if="isListHovering || freezeListHoverId === list.id"
      >
        <navigation-workspace-list-item-menu
          @hover:freeze="setHoverFreeze(list)"
          @hover:unfreeze="clearHoverFreeze"
          :list
        />
      </template>
    </v-list-item>
  </v-hover>
</template>

<style lang="scss">
.v-list-item--slim .v-list-item__prepend > .v-icon ~ .v-list-item__spacer {
  width: 10px;
}
</style>
