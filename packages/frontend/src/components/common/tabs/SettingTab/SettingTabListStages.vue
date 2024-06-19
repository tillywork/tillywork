<template>
  <v-card v-if="selectedListId" min-width="500">
    <v-card-title class="d-flex align-center">
      List Stages
      <base-icon-btn class="ms-4" @click="openDialogUpsert('Add')" />
    </v-card-title>
    <v-card-subtitle>
      List Stages are used to group cards into different stages, and they are
      nested within a list.
    </v-card-subtitle>
    <v-card-text>
      <v-table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Color</th>
            <th>Is Completed?</th>
          </tr>
        </thead>
        <draggable
          tag="tbody"
          v-model="draggableListStages"
          item-key="id"
          handle=".handle"
        >
          <template #item="{ element: row }">
            <tr>
              <td>
                <base-icon-btn
                  class="handle cursor-grab"
                  icon="mdi-cursor-move"
                  variant="text"
                />

                <v-menu>
                  <template #activator="{ props }">
                    <base-icon-btn v-bind="props" icon="mdi-dots-vertical" />
                  </template>
                  <v-card>
                    <v-list>
                      <v-list-item @click="openDialogUpsert('Edit', row)">
                        <template #prepend>
                          <v-icon size="x-small" icon="mdi-pencil" />
                        </template>
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        class="text-error"
                        @click="openDialogRemove(row)"
                      >
                        <template #prepend>
                          <v-icon size="x-small" icon="mdi-delete" />
                        </template>
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
              </td>
              <td>{{ row.name }}</td>
              <td>
                <v-icon
                  icon="mdi-circle-slice-8"
                  :color="row.color"
                  size="small"
                />
              </td>
              <td>
                <v-checkbox v-model="row.isCompleted" disabled></v-checkbox>
              </td>
            </tr>
          </template>
        </draggable>
      </v-table>
    </v-card-text>
  </v-card>
  <v-card v-else>
    <v-card-title class="d-flex align-center">
      Please select the list to edit its list stages
    </v-card-title>
    <v-card-text>
      <div class="d-flex ga-2 mb-1">
        <v-autocomplete
          v-model="selectedSpace"
          label="Space"
          :items="spaces"
          item-title="name"
          return-object
          @update:modelValue="onChangeSelectedSpace"
          min-width="250"
        />
        <v-autocomplete
          v-if="selectedSpace"
          v-model="selectedListId"
          label="List"
          :items="lists"
          item-title="name"
          item-value="id"
          min-width="250"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { DIALOGS } from '../../dialogs/types';
import { useDialogStore } from '@/stores/dialog';

import { useQueryClient } from '@tanstack/vue-query';
import { useWorkspaceStore } from '@/stores/workspace';
import { useSpacesService } from '@/composables/services/useSpacesService';
import { useListStagesService } from '@/composables/services/useListStagesService';
import type { Space } from '@/components/project-management/spaces/types';
import type {
  List,
  ListStage,
} from '@/components/project-management/lists/types';

import draggable from 'vuedraggable';

// Dialog
const dialog = useDialogStore();
const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.SETTINGS)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);
const dataTab = computed<{ list: Ref<List> } | undefined>(
  () => currentDialog.value.data?.dataTab
);
function openDialogUpsert(mode: 'Add' | 'Edit', listStage?: ListStage) {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_LIST_STAGE,
    data: {
      mode,
      listStage: {
        ...listStage,
        listId: selectedListId.value,
      },
    },
  });
}
function openDialogRemove(listStage: ListStage) {
  dialog.openDialog({
    dialog: DIALOGS.REMOVE_LIST_STAGE,
    data: {
      listStages: listStages.value,
      listStage,
    },
  });
}

// Core
const { selectedWorkspace } = storeToRefs(useWorkspaceStore());
const selectedSpace = ref<Space>();
const selectedListId = ref<number | undefined>(
  toValue(dataTab.value?.list)?.id
);
const spacesEnabled = computed<boolean>(() => !selectedListId.value);
const stagesEnabled = computed<boolean>(() => !!selectedListId.value);

const workspaceId = computed(() => selectedWorkspace.value?.id);
const lists = computed<List[]>(() => selectedSpace.value?.lists ?? []);
function onChangeSelectedSpace() {
  selectedListId.value = undefined;
}

const queryClient = useQueryClient();
const spacesService = useSpacesService();
const { data: spaces } = spacesService.useGetSpacesQuery({
  workspaceId,
  enabled: spacesEnabled,
});
const listStagesService = useListStagesService();
const { data: listStages } = listStagesService.useGetListStagesQuery({
  listId: selectedListId as Ref<number>,
  enabled: stagesEnabled,
});
const { mutateAsync: reorderListStage } =
  listStagesService.useReorderListStageMutation();

// Reorder
const draggableListStages = ref<ListStage[]>([]);
watch(listStages, () => (draggableListStages.value = listStages.value!), {
  immediate: true,
});

// Hooks
onUnmounted(() => {
  const listStagesToReorder = draggableListStages.value
    .map((listStage, idx) => {
      if (listStage.order !== idx + 1)
        return {
          id: listStage.id,
          order: idx + 1,
        };
    })
    .filter(Boolean) as Pick<ListStage, 'id' | 'order'>[];

  if (selectedListId.value && listStagesToReorder.length) {
    const payload = {
      listId: selectedListId.value,
      listStages: listStagesToReorder,
    };
    reorderListStage(payload).then(() =>
      queryClient.invalidateQueries({ queryKey: ['listGroups'] })
    );
  }
});
</script>
