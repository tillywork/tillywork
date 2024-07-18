<script setup lang="ts">
import type { CardType } from '@/components/project-management/cards/types';
import { useCardTypesService } from '@/composables/services/useCardTypesService';
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import BaseTable from '../tables/BaseTable/BaseTable.vue';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '../dialogs/types';

const { workspace } = storeToRefs(useAuthStore());
const cardTypesService = useCardTypesService();
const { data: fetchingCardTypes } = cardTypesService.useFindAllQuery({
  workspaceId: workspace.value!.id,
});

const dialog = useDialogStore();

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

function getCardTypeCreatedByPhoto(cardType: CardType) {
  return cardType.createdByType === 'system'
    ? useLogo().getCheckUrl()
    : cardType.createdBy.photo;
}

function getCardTypeCreatedByName(cardType: CardType) {
  return cardType.createdByType === 'system'
    ? 'System'
    : cardType.createdBy.firstName + ' ' + cardType.createdBy.lastName;
}
</script>

<template>
  <div id="container">
    <div class="user-select-none">
      <div class="d-flex items-center ga-2">
        <h3>Card Types</h3>
        <base-icon-btn @click="openCreateCardTypeDialog" />
      </div>

      <p class="text-subtitle-2 mb-2">
        Cards are the building block of tillywork. They can be tasks, contacts,
        or whatever you need them to be.
      </p>
    </div>

    <base-table
      :data="fetchingCardTypes ?? []"
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
      <!-- ~ Actions -->
      <template #actions="{ row }">
        <v-menu v-if="row.original.createdByType === 'user'">
          <template #activator="{ props }">
            <base-icon-btn v-bind="props" icon="mdi-dots-vertical" />
          </template>
          <v-card>
            <v-list>
              <!--
            <v-list-item>
              <template #prepend>
                <v-icon size="x-small" icon="mdi-pencil" />
              </template>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            -->
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

      <!-- ~ Name -->
      <template #name="{ row }">
        <span>
          {{ row.original.name }}
          <span
            v-if="workspace?.defaultCardType?.id === row.original.id"
            class="text-color-subtitle"
          >
            (default)
          </span>
        </span>
      </template>

      <!-- ~ Created By -->
      <template #createdBy="{ row }">
        <v-card class="py-2">
          <base-avatar
            :photo="getCardTypeCreatedByPhoto(row.original)"
            :text="getCardTypeCreatedByName(row.original)"
            rounded="circle"
            :class="
              row.original.createdByType === 'system' ? 'pa-1 bg-accent' : ''
            "
          />
          <span class="text-body-3 ms-3">
            {{ getCardTypeCreatedByName(row.original) }}
          </span>
        </v-card>
      </template>
    </base-table>
  </div>
</template>

<style lang="scss">
#container {
  width: 100%;
  max-width: 768px;
}
</style>
