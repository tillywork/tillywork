<script setup lang="ts">
import { type List } from '../lists/types';
import NavigationWorkspaceListItemMenu from './NavigationWorkspaceListItemMenu.vue';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '@/components/common/dialogs/types';

const route = useRoute();
const router = useRouter();

const props = defineProps<{
  list: List;
}>();

const dialog = useDialogStore();

const freezeListHoverId = ref<number | null>();

function handleListClick(list: List) {
  router.push(`/pm/list/${list.id}`);
}

function openUpdateListDialog() {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_LIST,
    data: {
      list: props.list,
      // ~ Upsertion
      mode: 'Update',
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
        <base-icon-btn
          icon="mdi-text-box-edit-outline"
          density="compact"
          v-tooltip:bottom="'Update'"
          @click.stop="openUpdateListDialog"
        />

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
