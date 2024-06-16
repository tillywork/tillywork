<template>
  <v-card min-width="500">
    <v-card-title class="d-flex align-center">
      List Stages
      <base-icon-btn class="ms-4" @click="openDialogUpsert('Add')" />
    </v-card-title>
    <v-card-subtitle>
      <strong class="text-red">TODO</strong>
      Please Provide Concise Description!
    </v-card-subtitle>
    <v-card-text>
      <v-fab
        size="small"
        extended
        :prepend-icon="
          isDraggableMode ? 'mdi-content-save-settings' : 'mdi-exchange'
        "
        :text="isDraggableMode ? 'Save Order' : 'Reorder'"
        @click="toggleIsDraggable"
      />

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
          :disabled="!isDraggableMode"
        >
          <template #item="{ element: row }">
            <tr>
              <td>
                <base-icon-btn
                  v-if="isDraggableMode"
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
</template>

<script setup lang="ts">
import { DIALOGS } from '../../dialogs/types';
import { useDialogStore } from '@/stores/dialog';
import { useListStagesService } from '@/composables/services/useListStagesService';
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
const dataTab = computed<{ list: Ref<List> }>(
  () => currentDialog.value.data?.dataTab
);
function openDialogUpsert(mode: 'Add' | 'Edit', listStage?: ListStage) {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_LIST_STAGE,
    data: {
      mode,
      listStage: {
        ...listStage,
        listId: listId.value,
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
const listId = computed<number>(() => {
  if (dataTab.value) {
    const list = toValue(dataTab.value.list);
    return list.id;
  }

  // NOTE: If we are accessing `Setting` dialog directly, how do we retrieve the `listId`?
  return 3; // TODO: Implement Get Current/Selected ListId
});
const listStagesService = useListStagesService();
const { data: listStages } = listStagesService.useGetListStagesQuery(
  listId.value
);
const { mutateAsync: reorderListStage } =
  listStagesService.useReorderListStageMutation();

// Reorder
const draggableListStages = ref<ListStage[]>([]);
watch(listStages, () => (draggableListStages.value = listStages.value!));
const isDraggableMode = ref(false);
function toggleIsDraggable() {
  isDraggableMode.value = !isDraggableMode.value;

  if (!isDraggableMode.value) {
    // TODO: Try to implement at onBeforeUnmount/onUnmounted instead
    const listStagesToReorder = draggableListStages.value
      .map((listStage, idx) => {
        if (listStage.order !== idx + 1)
          return {
            id: listStage.id,
            order: idx + 1,
          };
      })
      .filter(Boolean) as Pick<ListStage, 'id' | 'order'>[];

    const payload = {
      listId: listId.value,
      listStages: listStagesToReorder,
    };
    reorderListStage(payload);
  }
}
</script>
