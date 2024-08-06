<script setup lang="ts">
import { DIALOGS, UpsertDialogMode } from './types';
import { useDialogStore } from '@/stores/dialog';

import { useQueryClient } from '@tanstack/vue-query';
import { useListStagesService } from '@/services/useListStagesService';
import type { ListStage } from '@/components/project-management/lists/types';
import draggable from 'vuedraggable';

// Dialog
const dialog = useDialogStore();
const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.EDIT_LIST_STAGES)
);

const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

function openDialogUpsert(mode: UpsertDialogMode, listStage?: ListStage) {
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
const selectedListId = ref<number | undefined>(
  currentDialog.value?.data?.list?.id
);

const stagesEnabled = computed<boolean>(() => !!selectedListId.value);

const queryClient = useQueryClient();
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
    reorderListStage(payload).then(() => {
      queryClient.invalidateQueries({ queryKey: ['listGroups'] });
      queryClient.invalidateQueries({
        queryKey: ['lists', selectedListId.value],
      });
    });
  }
});
</script>

<template>
  <v-card
    v-if="selectedListId"
    color="surface"
    elevation="24"
    class="py-4 px-2"
  >
    <v-card-title class="d-flex align-center">
      List Stages
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        color="default"
        @click="dialog.closeDialog(currentDialogIndex)"
      />
    </v-card-title>
    <v-card-subtitle class="text-wrap">
      Define your work processes and pipelines using list stages.
    </v-card-subtitle>
    <v-card-text class="pa-2">
      <v-table>
        <thead>
          <tr>
            <th>Current stages</th>
            <th style="width: 25px">
              <base-icon-btn
                @click="openDialogUpsert(UpsertDialogMode.CREATE)"
              />
            </th>
          </tr>
        </thead>
        <draggable tag="tbody" v-model="draggableListStages" item-key="id">
          <template #item="{ element: row }">
            <tr class="cursor-grab">
              <td>
                <v-icon
                  icon="mdi-circle-slice-8"
                  :color="row.color"
                  size="small"
                  class="me-3"
                />
                {{ row.name }}
              </td>
              <td>
                <v-menu>
                  <template #activator="{ props }">
                    <base-icon-btn v-bind="props" icon="mdi-dots-vertical" />
                  </template>
                  <v-card>
                    <v-list>
                      <v-list-item
                        @click="openDialogUpsert(UpsertDialogMode.UPDATE, row)"
                      >
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
            </tr>
          </template>
        </draggable>
      </v-table>
    </v-card-text>
  </v-card>
</template>
