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
      <v-data-table
        class="border-thin rounded-md"
        :items="listStages"
        :headers="[
          {
            value: 'actions',
            width: 50,
          },
          {
            title: 'Name',
            value: 'name',
          },
          {
            title: 'Color',
            value: 'color',
          },
          {
            title: 'Is Completed',
            value: 'isCompleted',
          },
        ]"
        hide-default-footer
      >
        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <base-icon-btn v-bind="props" icon="mdi-dots-vertical" />
            </template>
            <v-card>
              <v-list>
                <v-list-item @click="openDialogUpsert('Edit', item)">
                  <template #prepend>
                    <v-icon size="x-small" icon="mdi-pencil" />
                  </template>
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item class="text-error" @click="openDialogRemove(item)">
                  <template #prepend>
                    <v-icon size="x-small" icon="mdi-delete" />
                  </template>
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>
        <template #item.color="{ item }">
          <v-icon icon="mdi-circle-slice-8" :color="item.color" size="small" />
        </template>
        <template #item.isCompleted="{ item }">
          <v-checkbox v-model="item.isCompleted" disabled></v-checkbox>
        </template>
      </v-data-table>
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

// TODO: Implement Reorder Functionality

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

const listId = computed<number>(() => {
  if (dataTab.value) {
    const list = toValue(dataTab.value.list);
    return list.id;
  }

  // NOTE: If we are accessing `Setting` dialog directly, how do we retrieve the `listId`?
  return 3; // TODO: Implement Get Current/Selected ListId
});

// Core
const { useGetListStagesQuery } = useListStagesService();
const { data: listStages } = useGetListStagesQuery(listId.value);
</script>
