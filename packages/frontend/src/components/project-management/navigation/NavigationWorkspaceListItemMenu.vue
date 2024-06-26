<script setup lang="ts">
import type { List } from '../lists/types';
import { useListsService } from '@/composables/services/useListsService';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryClient } from '@tanstack/vue-query';
import { DIALOGS, UpsertDialogMode } from '@/components/common/dialogs/types';
import { useWorkspaceStore } from '@/stores/workspace';
import type { CardType } from '../cards/types';
import { useDialogStore } from '@/stores/dialog';
import { SettingsTabs } from '@/components/common/dialogs/types';

const listMenu = ref(false);
const { useDeleteListMutation, useUpdateListMutation } = useListsService();
const { showSnackbar } = useSnackbarStore();
const queryClient = useQueryClient();
const dialog = useDialogStore();
const { selectedWorkspace } = storeToRefs(useWorkspaceStore());

const deleteListMutation = useDeleteListMutation();
const { mutateAsync: updateList } = useUpdateListMutation();

const props = defineProps<{
  list: List;
}>();
const emit = defineEmits(['hover:freeze', 'hover:unfreeze']);

const confirmDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);

function handleListMenuClick() {
  listMenu.value = !listMenu.value;
  emit('hover:freeze');
}

function handleDeleteList(list: List) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: 'Are you sure you want to delete this list?',
      onCancel: () => dialog.closeDialog(confirmDialogIndex.value),
      onConfirm: () => deleteList(list),
      isLoading: deleteListMutation.isPending.value,
    },
  });
}

function deleteList(list: List) {
  deleteListMutation
    .mutateAsync(list.id)
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['list', list.id] });
      dialog.closeDialog(confirmDialogIndex.value);
    })
    .catch((e) => {
      console.log(e);
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 3000,
      });
    });
}

function isCardTypeSetAsListDefault(cardType: CardType) {
  return cardType.id === props.list.defaultCardType.id;
}

function handleUpdateDefaultCardType(cardType: CardType) {
  if (!isCardTypeSetAsListDefault(cardType)) {
    updateList({
      id: props.list.id,
      updateDto: {
        defaultCardType: cardType,
      },
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [
            'spaces',
            {
              workspaceId: selectedWorkspace.value?.id,
            },
          ],
        });
      })
      .catch(() => {
        showSnackbar({
          message: 'Something went wrong, please try again.',
          color: 'error',
        });
      });
  }
}

function openSettingsDialog(activeTab: SettingsTabs) {
  dialog.openDialog({
    dialog: DIALOGS.SETTINGS,
    data: {
      activeTab,
    },
    options: {
      fullscreen: true,
    },
  });
}

function openEditStagesDialog(list: List) {
  listMenu.value = false;
  dialog.openDialog({
    dialog: DIALOGS.EDIT_LIST_STAGES,
    data: {
      list,
    },
  });
}

function openUpdateListDialog(list: List) {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_LIST,
    data: {
      list,
      mode: UpsertDialogMode.UPDATE,
    },
  });
  listMenu.value = false;
}

watch(listMenu, () => {
  if (!listMenu.value) {
    emit('hover:unfreeze');
  }
});
</script>

<template>
  <base-icon-btn
    id="list-menu-btn"
    icon="mdi-dots-vertical"
    @click.stop="handleListMenuClick"
    density="compact"
  />

  <v-menu
    v-model="listMenu"
    target="#list-menu-btn"
    :close-on-content-click="false"
    width="220"
  >
    <v-card :loading="deleteListMutation.isPending.value">
      <v-list>
        <v-list-item @click="openUpdateListDialog(list)">
          <template #prepend>
            <v-icon icon="mdi-playlist-edit" />
          </template>
          <v-list-item-title>Rename</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openSettingsDialog(SettingsTabs.FIELDS)">
          <template #prepend>
            <v-icon icon="mdi-form-select" />
          </template>
          <v-list-item-title>Custom fields</v-list-item-title>
        </v-list-item>
        <v-menu location="end" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon icon="mdi-toy-brick-outline" />
              </template>
              <v-list-item-title>Default card type</v-list-item-title>
              <template #append>
                <v-icon icon="mdi-chevron-right" />
              </template>
            </v-list-item>
          </template>
          <v-card>
            <v-card-title class="d-flex align-center pt-2 pe-1">
              <span class="text-body-2">Card Types</span>
              <v-spacer />
              <v-btn
                size="small"
                variant="text"
                class="text-capitalize"
                @click="openSettingsDialog(SettingsTabs.CARD_TYPES)"
                >Edit</v-btn
              >
            </v-card-title>
            <v-list min-height="200">
              <template
                v-for="cardType in selectedWorkspace?.cardTypes"
                :key="cardType.id"
              >
                <v-list-item
                  :active="isCardTypeSetAsListDefault(cardType)"
                  @click="handleUpdateDefaultCardType(cardType)"
                >
                  <v-list-item-title>{{ cardType.name }}</v-list-item-title>
                  <template #append>
                    <v-icon
                      size="x-small"
                      icon="mdi-check"
                      v-if="isCardTypeSetAsListDefault(cardType)"
                    />
                  </template>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </v-menu>
        <v-list-item @click="openEditStagesDialog(list)">
          <template #prepend>
            <v-icon icon="mdi-text-box-edit" />
          </template>
          <v-list-item-title>Edit stages</v-list-item-title>
        </v-list-item>
        <v-list-item class="text-error" @click="handleDeleteList(list)">
          <template #prepend>
            <v-icon icon="mdi-delete" />
          </template>
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>
