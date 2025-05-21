<script setup lang="ts">
import { useCardTypesService } from '@/services/useCardTypesService';
import { useAuthStore } from '@/stores/auth';
import BaseTable from '../tables/BaseTable/BaseTable.vue';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '../dialogs/types';
import { useCreatedBy } from '@/composables/useCreatedBy';
import type { CardType } from '@tillywork/shared';
import { SettingsType } from './types';

const router = useRouter();

const { workspace } = storeToRefs(useAuthStore());
const cardTypesService = useCardTypesService();
const { data: fetchingCardTypes } = cardTypesService.useFindAllQuery({
  workspaceId: workspace.value!.id,
});

const { getCreatedByName, getCreatedByPhoto } = useCreatedBy();

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

function handleCardTypeClick(cardType: CardType) {
  router.push(`/settings/${SettingsType.CARD_TYPES}/${cardType.id}`);
}
</script>

<template>
  <div class="user-select-none">
    <div class="d-flex items-center ga-2">
      <h3>Card Types</h3>
      <base-icon-btn @click="openCreateCardTypeDialog" />
    </div>

    <p class="text-subtitle-2 mb-2 text-color-subtitle">
      Cards are the building block of tillywork. They can be tasks, contacts, or
      whatever you need them to be.
    </p>
  </div>

  <v-divider class="my-6" />

  <base-table
    :data="fetchingCardTypes ?? []"
    :columns="[
      {
        id: 'actions',
        size: 60,
      },
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
      },
      {
        id: 'hasChildren',
        header: 'Has Children',
        accessorKey: 'hasChildren',
      },
      {
        id: 'createdBy',
        header: 'Created By',
        accessorKey: 'createdBy',
        size: 300,
      },
    ]"
    @click:row="handleCardTypeClick"
  >
    <!-- ~ Actions -->
    <template #actions="{ row }">
      <v-menu v-if="row.original.createdByType === 'user'">
        <template #activator="{ props }">
          <div class="d-flex justify-end w-100">
            <base-icon-btn v-bind="props" icon="mdi-dots-vertical" />
          </div>
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

    <template #hasChildren="{ row }">
      <v-icon :icon="row.original.hasChildren ? 'mdi-check' : 'mdi-close'" />
    </template>

    <!-- ~ Created By -->
    <template #createdBy="{ row }">
      <v-card class="py-2">
        <base-avatar
          :photo="getCreatedByPhoto(row.original)"
          :text="getCreatedByName(row.original)"
          rounded="circle"
          :class="
            row.original.createdByType === 'system' ? 'pa-1 bg-accent' : ''
          "
        />
        <span class="text-body-3 ms-3">
          {{ getCreatedByName(row.original) }}
        </span>
      </v-card>
    </template>
  </base-table>
</template>
