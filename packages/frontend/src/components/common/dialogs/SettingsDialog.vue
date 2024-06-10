<script setup lang="ts">
import { useDialog } from '@/composables/useDialog';
import BaseThemeSwitch from '../base/BaseThemeSwitch.vue';
import { useCardTypesService } from '@/composables/services/useCardTypesService';
import { useWorkspaceStore } from '@/stores/workspace';
import { DIALOGS } from './types';
import type { CardType } from '@/components/project-management/cards/types';

const dialog = useDialog();
const { selectedWorkspace } = storeToRefs(useWorkspaceStore());
const { useFindAllQuery, useRemoveMutation } = useCardTypesService();

const { data: cardTypes } = useFindAllQuery({
  workspaceId: selectedWorkspace.value!.id,
});

const { mutateAsync: removeCardType, isPending } = useRemoveMutation();

const tabs = ref([
  {
    icon: 'mdi-monitor-screenshot',
    text: 'Theme',
    value: 'theme',
  },
  {
    icon: 'mdi-toy-brick-outline',
    text: 'Card Types',
    value: 'cardTypes',
  },
]);

function openCreateCardTypeDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_CARD_TYPE,
  });
}

//TODO we need to use a custom dialog here, so we can choose the new card type that existing cards and lists will use instead.
function openConfirmCardTypeDeleteDialog(cardType: CardType) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      message: 'Are you sure you want to delete this card type?',
      onConfirm: () =>
        removeCardType(cardType.id).then(() => dialog.closeDialog()),
      onCancel: dialog.closeDialog,
      isLoading: isPending,
    },
  });
}
</script>

<template>
  <v-card class="pa-4">
    <v-card-title class="d-flex">
      Settings
      <v-spacer />
      <base-icon-btn
        icon="mdi-close"
        size="default"
        @click="dialog.closeDialog"
      />
    </v-card-title>
    <v-card-text class="d-flex flex-row">
      <v-tabs
        direction="vertical"
        color="primary"
        density="compact"
        :items="tabs"
        class="border-e-thin"
        height="50"
        center-active
        mandatory
        model-value="theme"
      >
        <template #tab="{ item }">
          <v-tab
            :prepend-icon="item.icon"
            :text="item.text"
            :value="item.value"
            class="text-none"
          ></v-tab>
        </template>
        <template #item.theme>
          <v-card>
            <v-card-title class="d-flex align-center"> Theme </v-card-title>
            <v-card-subtitle>Select the theme to use.</v-card-subtitle>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <base-theme-switch />
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </template>
        <template #item.cardTypes>
          <v-card min-width="500">
            <v-card-title class="d-flex align-center">
              Card Types
              <base-icon-btn class="ms-4" @click="openCreateCardTypeDialog" />
            </v-card-title>
            <v-card-subtitle
              >Cards are the building block of tillywork. They can be tasks,
              contacts, or whatever you need them to be.</v-card-subtitle
            >
            <v-card-text>
              <v-data-table
                class="border-thin rounded-md"
                :items="cardTypes"
                :headers="[
                  {
                    value: 'actions',
                    width: 50,
                  },
                  {
                    title: 'ID',
                    value: 'id',
                    width: 100,
                  },
                  {
                    title: 'Name',
                    value: 'name',
                  },
                ]"
                :hide-default-footer="true"
              >
                <template #item.actions="{ item }">
                  <v-menu>
                    <template #activator="{ props }">
                      <base-icon-btn v-bind="props" icon="mdi-dots-vertical" />
                    </template>
                    <v-card>
                      <v-list>
                        <v-list-item>
                          <template #prepend>
                            <v-icon size="x-small" icon="mdi-pencil" />
                          </template>
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item
                          class="text-error"
                          @click="openConfirmCardTypeDeleteDialog(item)"
                        >
                          <template #prepend>
                            <v-icon size="x-small" icon="mdi-delete" />
                          </template>
                          <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </template>
      </v-tabs>
    </v-card-text>
  </v-card>
</template>
