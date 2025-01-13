<script setup lang="ts">
import { useListGroupsService } from '@/services/useListGroupsService';
import { type List, type ListGroup } from '../../lists/types';
import { useListStagesService } from '@/services/useListStagesService';
import { useProjectUsersService } from '@/services/useProjectUsersService';
import BoardViewGroup from './BoardViewGroup.vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAuthStore } from '@/stores/auth';
import type { View } from '@tillywork/shared';

const isLoading = defineModel<boolean>('loading');

const props = defineProps<{
  view: View;
  list: List;
  listGroups: ListGroup[];
}>();

const { showSnackbar } = useSnackbarStore();
const { project } = storeToRefs(useAuthStore());

const listGroupsService = useListGroupsService();
const { mutateAsync: updateListGroup } =
  listGroupsService.useUpdateListGroupMutation();

const listsStagesService = useListStagesService();
const { data: listStages } = listsStagesService.useGetListStagesQuery({
  listId: props.view.listId,
});

const projectUsersService = useProjectUsersService();
const { data: projectUsers } = projectUsersService.useProjectUsersQuery({
  projectId: project.value!.id,
});

function toggleGroupExpansion(listGroup: ListGroup) {
  updateListGroup({
    ...listGroup,
    isExpanded: !listGroup.isExpanded,
  })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    })
    .finally(() => {
      isLoading.value = false;
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
            v-model:loading="isLoading"
            :list-group="listGroup"
            :list-stages="listStages ?? []"
            :view
            :list
            :project-users="projectUsers ?? []"
            @toggle:group="toggleGroupExpansion"
          />
        </template>
      </v-sheet>
    </div>
  </div>
</template>
