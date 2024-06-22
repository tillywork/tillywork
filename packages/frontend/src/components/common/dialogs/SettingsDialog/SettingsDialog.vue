<script setup lang="ts">
import BaseThemeSwitch from '../../base/BaseThemeSwitch.vue';
import { useCardTypesService } from '@/composables/services/useCardTypesService';
import { useWorkspaceStore } from '@/stores/workspace';
import { DIALOGS, SettingsTabs, type SettingsTab } from '../types';
import type { CardType } from '@/components/project-management/cards/types';
import { useLogo } from '@/composables/useLogo';
import { useDialogStore } from '@/stores/dialog';
import SettingsDialogFieldsTab from './SettingsDialogFieldsTab.vue';
import BaseTable from '../../tables/BaseTable/BaseTable.vue';

const dialog = useDialogStore();
const { selectedWorkspace } = storeToRefs(useWorkspaceStore());
const { useFindAllQuery } = useCardTypesService();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.SETTINGS)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

const { data: cardTypes } = useFindAllQuery({
  workspaceId: selectedWorkspace.value!.id,
});

const tabs = ref<SettingsTab[]>([
  {
    icon: 'mdi-monitor-screenshot',
    text: 'Theme',
    value: SettingsTabs.THEME,
  },
  {
    icon: 'mdi-toy-brick-outline',
    text: 'Card Types',
    value: SettingsTabs.CARD_TYPES,
  },
  {
    icon: 'mdi-toy-brick',
    text: 'Custom Fields',
    value: SettingsTabs.FIELDS,
  },
]);

function openCreateCardTypeDialog() {
  dialog.openDialog({
    dialog: DIALOGS.CREATE_CARD_TYPE,
  });
}

function openRemoveCardTypeDialog(cardType: CardType) {
  dialog.openDialog({
    dialog: DIALOGS.REMOVE_CARD_TYPE,
    data: {
      cardType,
    },
  });
}

function getCardTypeCreatedByName(cardType: CardType) {
  return cardType.createdByType === 'system'
    ? 'System'
    : cardType.createdBy.firstName + ' ' + cardType.createdBy.lastName;
}

function getCardTypeCreatedByPhoto(cardType: CardType) {
  return cardType.createdByType === 'system'
    ? useLogo().getCheckUrl()
    : cardType.createdBy.photo;
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
        @click="dialog.closeDialog(currentDialogIndex)"
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
        :model-value="currentDialog?.data?.activeTab ?? 'theme'"
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
              <base-table
                :data="cardTypes ?? []"
                :columns="[
                  {
                    id: 'actions',
                    size: 50,
                  },
                  {
                    id: 'name',
                    header: 'Name',
                    accessorKey: 'name',
                  },
                  {
                    id: 'createdBy',
                    header: 'Created By',
                    accessorKey: 'createdBy',
                    size: 300,
                  },
                ]"
              >
                <template #name="{ row }">
                  <span>
                    {{ row.original.name }}
                    <span
                      v-if="
                        selectedWorkspace?.defaultCardType?.id ===
                        row.original.id
                      "
                      class="text-color-subtitle"
                    >
                      (default)
                    </span>
                  </span>
                </template>
                <template #actions="{ row }">
                  <v-menu v-if="row.original.createdByType === 'user'">
                    <template #activator="{ props }">
                      <base-icon-btn v-bind="props" icon="mdi-dots-vertical" />
                    </template>
                    <v-card>
                      <v-list>
                        <!-- <v-list-item>
                          <template #prepend>
                            <v-icon size="x-small" icon="mdi-pencil" />
                          </template>
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item> -->
                        <v-list-item
                          class="text-error"
                          @click="openRemoveCardTypeDialog(row.original)"
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
                <template #createdBy="{ row }">
                  <v-card class="py-2">
                    <base-avatar
                      :photo="getCardTypeCreatedByPhoto(row.original)"
                      :text="getCardTypeCreatedByName(row.original)"
                      rounded="circle"
                      :class="
                        row.original.createdByType === 'system'
                          ? 'pa-1 bg-accent'
                          : ''
                      "
                    />
                    <span class="text-body-2 ms-3">
                      {{ getCardTypeCreatedByName(row.original) }}
                    </span>
                  </v-card>
                </template>
              </base-table>
            </v-card-text>
          </v-card>
        </template>
        <template #item.fields>
          <settings-dialog-fields-tab />
        </template>
      </v-tabs>
    </v-card-text>
  </v-card>
</template>
