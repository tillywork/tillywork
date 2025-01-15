<script setup lang="ts">
import { useListGroupsService } from '@/services/useListGroupsService';
import BoardViewGroup from './BoardViewGroup.vue';
import { useSnackbarStore } from '@/stores/snackbar';
import type { List, ListGroup, View } from '@tillywork/shared';

const { view, list, listGroups } = defineProps<{
  view: View;
  list: List;
  listGroups: ListGroup[];
}>();

const { showSnackbar } = useSnackbarStore();

const listGroupsService = useListGroupsService();
const { mutateAsync: updateListGroup } =
  listGroupsService.useUpdateListGroupMutation();

function toggleGroupExpansion(listGroup: ListGroup) {
  updateListGroup({
    ...listGroup,
    isExpanded: !listGroup.isExpanded,
  }).catch(() => {
    showSnackbar({
      message: 'Something went wrong, please try again.',
      color: 'error',
      timeout: 5000,
    });
  });
}
</script>

<template>
  <div class="board-view overflow-auto">
    <div class="board">
      <v-sheet
        class="board-groups d-flex ga-4 overflow-scroll px-2"
        color="transparent"
        width="fit-content"
      >
        <template v-for="listGroup in listGroups" :key="listGroup.id">
          <board-view-group
            :list-group="listGroup"
            :view
            :list
            @toggle:group="toggleGroupExpansion"
          />
        </template>
      </v-sheet>
    </div>
  </div>
</template>
